import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class QueryClassSessionsDto {
  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsIn(['SCHEDULED', 'COMPLETED', 'CANCELLED'])
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}
