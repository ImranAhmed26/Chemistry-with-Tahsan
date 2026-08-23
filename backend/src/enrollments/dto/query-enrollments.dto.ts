import { IsIn, IsOptional, IsString } from 'class-validator';

export class QueryEnrollmentsDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'COMPLETED', 'WITHDRAWN'])
  status?: 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN';
}
