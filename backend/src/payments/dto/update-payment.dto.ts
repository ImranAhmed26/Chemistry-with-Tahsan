import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

const METHODS = ['CASH', 'BKASH', 'NAGAD', 'BANK_TRANSFER', 'OTHER'];
const STATUSES = ['PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'];

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsIn(METHODS)
  method?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;
}
