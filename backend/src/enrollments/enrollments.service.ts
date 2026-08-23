import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { QueryEnrollmentsDto } from './dto/query-enrollments.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: QueryEnrollmentsDto) {
    const where: Prisma.EnrollmentWhereInput = { tenantId };
    if (query.studentId) where.studentId = query.studentId;
    if (query.batchId) where.batchId = query.batchId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, studentCode: true } },
          course: { select: { id: true, name: true } },
          batch: { select: { id: true, name: true } },
        },
        orderBy: { enrolledAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return { data, total };
  }

  async create(tenantId: string, dto: CreateEnrollmentDto) {
    const [student, course, batch] = await Promise.all([
      this.prisma.student.findFirst({ where: { id: dto.studentId, tenantId } }),
      this.prisma.course.findFirst({ where: { id: dto.courseId, tenantId } }),
      this.prisma.batch.findFirst({ where: { id: dto.batchId, tenantId } }),
    ]);
    if (!student) throw new BadRequestException('Student not found for this tenant');
    if (!course) throw new BadRequestException('Course not found for this tenant');
    if (!batch) throw new BadRequestException('Batch not found for this tenant');

    if (batch.capacity != null) {
      const activeCount = await this.prisma.enrollment.count({
        where: { tenantId, batchId: dto.batchId, status: 'ACTIVE' },
      });
      if (activeCount >= batch.capacity) {
        throw new BadRequestException('Batch has reached its capacity');
      }
    }

    return this.prisma.enrollment.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        courseId: dto.courseId,
        batchId: dto.batchId,
        status: 'ACTIVE',
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateEnrollmentDto) {
    const enrollment = await this.prisma.enrollment.findFirst({ where: { id, tenantId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    return this.prisma.enrollment.update({
      where: { id },
      data: {
        ...dto,
        endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
      },
    });
  }
}
