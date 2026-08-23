import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentsDto } from './dto/query-payments.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: QueryPaymentsDto) {
    const where: Prisma.PaymentWhereInput = { tenantId };
    if (query.studentId) where.studentId = query.studentId;
    if (query.status) where.status = query.status as PaymentStatus;

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: { student: { select: { id: true, name: true, studentCode: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { data, total };
  }

  async create(tenantId: string, dto: CreatePaymentDto) {
    const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, tenantId } });
    if (!student) throw new BadRequestException('Student not found for this tenant');

    if (dto.enrollmentId) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: { id: dto.enrollmentId, tenantId },
      });
      if (!enrollment) throw new BadRequestException('Enrollment not found for this tenant');
    }

    const amount = dto.amount;
    const paidAmount = dto.paidAmount ?? 0;
    const dueAmount = amount - paidAmount;
    const status = dto.status === 'OVERDUE' ? PaymentStatus.OVERDUE : this.deriveStatus(amount, paidAmount);

    return this.prisma.payment.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        enrollmentId: dto.enrollmentId,
        amount,
        paidAmount,
        dueAmount,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
        method: dto.method as PaymentMethod | undefined,
        notes: dto.notes,
        status,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdatePaymentDto) {
    const payment = await this.prisma.payment.findFirst({ where: { id, tenantId } });
    if (!payment) throw new NotFoundException('Payment not found');

    const amount = dto.amount ?? Number(payment.amount);
    const paidAmount = dto.paidAmount ?? Number(payment.paidAmount);
    const amountOrPaidChanged = dto.amount !== undefined || dto.paidAmount !== undefined;
    const dueAmount = amountOrPaidChanged ? amount - paidAmount : undefined;
    const status =
      dto.status === 'OVERDUE'
        ? PaymentStatus.OVERDUE
        : amountOrPaidChanged
          ? this.deriveStatus(amount, paidAmount)
          : (dto.status as PaymentStatus | undefined);

    return this.prisma.payment.update({
      where: { id },
      data: {
        amount: dto.amount,
        paidAmount: dto.paidAmount,
        dueAmount,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
        method: dto.method as PaymentMethod | undefined,
        notes: dto.notes,
        status,
      },
    });
  }

  private deriveStatus(amount: number, paidAmount: number): PaymentStatus {
    if (paidAmount <= 0) return PaymentStatus.PENDING;
    if (paidAmount >= amount) return PaymentStatus.PAID;
    return PaymentStatus.PARTIALLY_PAID;
  }
}
