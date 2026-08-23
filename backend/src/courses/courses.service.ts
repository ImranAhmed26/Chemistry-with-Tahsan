import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCoursesDto } from './dto/query-courses.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: QueryCoursesDto) {
    const where: Prisma.CourseWhereInput = { tenantId };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.course.findMany({ where, orderBy: { createdAt: 'desc' } }),
      this.prisma.course.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(tenantId: string, id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, tenantId },
      include: {
        batches: {
          select: { id: true, name: true, status: true, capacity: true, startDate: true, endDate: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  create(tenantId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({ data: { ...dto, tenantId } });
  }

  async update(tenantId: string, id: string, dto: UpdateCourseDto) {
    await this.ensureExists(tenantId, id);
    return this.prisma.course.update({ where: { id }, data: { ...dto } });
  }

  private async ensureExists(tenantId: string, id: string) {
    const course = await this.prisma.course.findFirst({ where: { id, tenantId } });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }
}
