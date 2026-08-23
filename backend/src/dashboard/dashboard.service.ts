import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(tenantId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      activeStudents,
      activeBatches,
      activeCourses,
      upcomingClassSessions,
      recentCompletedSessions,
      pendingPayments,
      recentStudents,
    ] = await Promise.all([
      this.prisma.student.count({ where: { tenantId } }),
      this.prisma.student.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.batch.count({ where: { tenantId, status: 'ONGOING' } }),
      this.prisma.course.count({ where: { tenantId, status: 'ACTIVE' } }),
      this.prisma.classSession.findMany({
        where: { tenantId, status: 'SCHEDULED', date: { gte: startOfToday } },
        include: { batch: { select: { name: true } } },
        orderBy: { date: 'asc' },
        take: 5,
      }),
      this.prisma.classSession.findMany({
        where: { tenantId, status: 'COMPLETED' },
        include: { batch: { select: { name: true } }, attendances: { select: { status: true } } },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      this.prisma.payment.findMany({
        where: { tenantId, status: { not: 'PAID' } },
        include: { student: { select: { name: true } } },
        orderBy: { dueAmount: 'desc' },
        take: 5,
      }),
      this.prisma.student.findMany({
        where: { tenantId },
        select: { id: true, name: true, studentCode: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totalStudents,
      activeStudents,
      activeBatches,
      activeCourses,
      upcomingClasses: upcomingClassSessions.map((s) => ({
        id: s.id,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        topic: s.topic,
        batchName: s.batch.name,
      })),
      recentAttendance: recentCompletedSessions.map((s) => ({
        id: s.id,
        date: s.date,
        batchName: s.batch.name,
        presentCount: s.attendances.filter((a) => a.status === 'PRESENT').length,
        totalCount: s.attendances.length,
      })),
      pendingPayments: pendingPayments.map((p) => ({
        id: p.id,
        studentName: p.student.name,
        dueAmount: p.dueAmount,
        status: p.status,
      })),
      recentStudents,
    };
  }
}
