import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { QueryBatchesDto } from './dto/query-batches.dto';

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: QueryBatchesDto) {
    const where: Prisma.BatchWhereInput = { tenantId };
    if (query.courseId) where.courseId = query.courseId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.batch.findMany({
        where,
        include: { course: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.batch.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(tenantId: string, id: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id, tenantId },
      include: { course: true },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    const activeEnrollments = await this.prisma.enrollment.findMany({
      where: { tenantId, batchId: id, status: 'ACTIVE' },
      include: {
        student: {
          select: { id: true, name: true, studentCode: true, photoUrl: true, status: true },
        },
      },
      orderBy: { enrolledAt: 'asc' },
    });

    return {
      ...batch,
      students: activeEnrollments.map((e) => ({ ...e.student, enrollmentId: e.id, enrolledAt: e.enrolledAt })),
      enrolledCount: activeEnrollments.length,
      capacity: batch.capacity,
    };
  }

  async create(tenantId: string, dto: CreateBatchDto) {
    const course = await this.prisma.course.findFirst({ where: { id: dto.courseId, tenantId } });
    if (!course) throw new BadRequestException('Course not found for this tenant');

    return this.prisma.batch.create({
      data: {
        tenantId,
        courseId: dto.courseId,
        name: dto.name,
        schedule: dto.schedule,
        capacity: dto.capacity,
        status: dto.status,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateBatchDto) {
    await this.ensureExists(tenantId, id);

    if (dto.courseId) {
      const course = await this.prisma.course.findFirst({ where: { id: dto.courseId, tenantId } });
      if (!course) throw new BadRequestException('Course not found for this tenant');
    }

    return this.prisma.batch.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  private async ensureExists(tenantId: string, id: string) {
    const batch = await this.prisma.batch.findFirst({ where: { id, tenantId } });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }
}
