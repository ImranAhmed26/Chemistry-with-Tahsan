import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';
import { QueryClassSessionsDto } from './dto/query-class-sessions.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class ClassSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: QueryClassSessionsDto) {
    const where: Prisma.ClassSessionWhereInput = { tenantId };
    if (query.batchId) where.batchId = query.batchId;
    if (query.status) where.status = query.status;
    if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }

    const [data, total] = await Promise.all([
      this.prisma.classSession.findMany({
        where,
        include: { batch: { select: { id: true, name: true } } },
        orderBy: { date: 'desc' },
      }),
      this.prisma.classSession.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(tenantId: string, id: string) {
    const session = await this.getSessionOrThrow(tenantId, id);

    const [activeEnrollments, attendances] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { tenantId, batchId: session.batchId, status: 'ACTIVE' },
        include: { student: { select: { id: true, name: true, studentCode: true, photoUrl: true } } },
      }),
      this.prisma.attendance.findMany({ where: { tenantId, classSessionId: id } }),
    ]);

    const attendanceByStudent = new Map(attendances.map((a) => [a.studentId, a]));
    const students = activeEnrollments.map((e) => ({
      ...e.student,
      enrollmentId: e.id,
      attendance: attendanceByStudent.get(e.studentId) ?? null,
    }));

    return { ...session, students, attendances };
  }

  async create(tenantId: string, dto: CreateClassSessionDto) {
    const batch = await this.prisma.batch.findFirst({ where: { id: dto.batchId, tenantId } });
    if (!batch) throw new BadRequestException('Batch not found for this tenant');

    return this.prisma.classSession.create({
      data: {
        tenantId,
        batchId: dto.batchId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        topic: dto.topic,
        notes: dto.notes,
        status: dto.status,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateClassSessionDto) {
    await this.getSessionOrThrow(tenantId, id);

    if (dto.batchId) {
      const batch = await this.prisma.batch.findFirst({ where: { id: dto.batchId, tenantId } });
      if (!batch) throw new BadRequestException('Batch not found for this tenant');
    }

    return this.prisma.classSession.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async getAttendance(tenantId: string, sessionId: string) {
    const session = await this.getSessionOrThrow(tenantId, sessionId);

    const [activeEnrollments, attendances] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { tenantId, batchId: session.batchId, status: 'ACTIVE' },
        include: { student: { select: { id: true, name: true } } },
      }),
      this.prisma.attendance.findMany({ where: { tenantId, classSessionId: sessionId } }),
    ]);

    const attendanceByStudent = new Map(attendances.map((a) => [a.studentId, a.status]));

    return activeEnrollments.map((e) => ({
      studentId: e.student.id,
      studentName: e.student.name,
      status: attendanceByStudent.get(e.student.id) ?? null,
    }));
  }

  async markAttendance(tenantId: string, sessionId: string, dto: MarkAttendanceDto) {
    const session = await this.getSessionOrThrow(tenantId, sessionId);

    const activeEnrollments = await this.prisma.enrollment.findMany({
      where: { tenantId, batchId: session.batchId, status: 'ACTIVE' },
    });
    const enrollmentByStudent = new Map(activeEnrollments.map((e) => [e.studentId, e]));

    for (const record of dto.records) {
      const enrollment = enrollmentByStudent.get(record.studentId);
      if (!enrollment) {
        throw new BadRequestException(
          `Student ${record.studentId} is not actively enrolled in this session's batch`,
        );
      }
    }

    await this.prisma.$transaction(
      dto.records.map((record) => {
        const enrollment = enrollmentByStudent.get(record.studentId);
        return this.prisma.attendance.upsert({
          where: { classSessionId_studentId: { classSessionId: sessionId, studentId: record.studentId } },
          create: {
            tenantId,
            classSessionId: sessionId,
            studentId: record.studentId,
            enrollmentId: enrollment?.id,
            status: record.status,
          },
          update: {
            status: record.status,
            enrollmentId: enrollment?.id,
            markedAt: new Date(),
          },
        });
      }),
    );

    await this.prisma.classSession.update({ where: { id: sessionId }, data: { status: 'COMPLETED' } });

    return this.getAttendance(tenantId, sessionId);
  }

  private async getSessionOrThrow(tenantId: string, id: string) {
    const session = await this.prisma.classSession.findFirst({ where: { id, tenantId } });
    if (!session) throw new NotFoundException('Class session not found');
    return session;
  }
}
