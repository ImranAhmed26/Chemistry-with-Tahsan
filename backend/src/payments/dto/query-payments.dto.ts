import { IsIn, IsOptional, IsString } from 'class-validator';

const STATUSES = ['PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'];

export class QueryPaymentsDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;
}
