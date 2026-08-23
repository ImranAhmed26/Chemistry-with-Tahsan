import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StudentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { CreateStudentNoteDto } from './dto/create-student-note.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: QueryStudentsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.StudentWhereInput = { tenantId };
    if (query.status) where.status = query.status;
    if (query.academicLevel) where.academicLevel = query.academicLevel;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { studentCode: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.student.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(tenantId: string, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
      include: {
        enrollments: {
          include: {
            course: { select: { id: true, name: true } },
            batch: { select: { id: true, name: true } },
          },
          orderBy: { enrolledAt: 'desc' },
        },
        payments: { orderBy: { createdAt: 'desc' } },
        studentNotes: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    const attendances = await this.prisma.attendance.findMany({
      where: { tenantId, studentId: id },
      select: { status: true },
    });
    const totalCount = attendances.length;
    const presentCount = attendances.filter((a) => a.status === 'PRESENT').length;
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 10000) / 100 : 0;

    const paymentStatus = this.rollupPaymentStatus(student.payments.map((p) => p.status));

    return {
      ...student,
      attendanceSummary: { presentCount, totalCount, percentage },
      paymentStatus,
    };
  }

  private rollupPaymentStatus(statuses: string[]): string | null {
    if (statuses.length === 0) return null;
    if (statuses.includes('OVERDUE')) return 'OVERDUE';
    if (statuses.includes('PENDING')) return 'PENDING';
    if (statuses.includes('PARTIALLY_PAID')) return 'PARTIALLY_PAID';
    return 'PAID';
  }

  async create(tenantId: string, dto: CreateStudentDto) {
    let studentCode = dto.studentCode;
    if (studentCode) {
      const existing = await this.prisma.student.findFirst({ where: { tenantId, studentCode } });
      if (existing) {
        throw new BadRequestException('studentCode already exists for this tenant');
      }
    } else {
      const count = await this.prisma.student.count({ where: { tenantId } });
      studentCode = `STU-${String(count + 1).padStart(4, '0')}`;
    }

    return this.prisma.student.create({
      data: { ...dto, tenantId, studentCode },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateStudentDto) {
    await this.ensureExists(tenantId, id);

    if (dto.studentCode) {
      const existing = await this.prisma.student.findFirst({
        where: { tenantId, studentCode: dto.studentCode, NOT: { id } },
      });
      if (existing) {
        throw new BadRequestException('studentCode already exists for this tenant');
      }
    }

    return this.prisma.student.update({ where: { id }, data: { ...dto } });
  }

  archive(tenantId: string, id: string) {
    return this.setStatus(tenantId, id, StudentStatus.ARCHIVED);
  }

  reactivate(tenantId: string, id: string) {
    return this.setStatus(tenantId, id, StudentStatus.ACTIVE);
  }

  async addNote(tenantId: string, studentId: string, authorUserId: string, dto: CreateStudentNoteDto) {
    await this.ensureExists(tenantId, studentId);
    return this.prisma.studentNote.create({
      data: { tenantId, studentId, authorUserId, content: dto.content },
    });
  }

  private async setStatus(tenantId: string, id: string, status: StudentStatus) {
    await this.ensureExists(tenantId, id);
    return this.prisma.student.update({ where: { id }, data: { status } });
  }

  private async ensureExists(tenantId: string, id: string) {
    const student = await this.prisma.student.findFirst({ where: { id, tenantId } });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }
}
