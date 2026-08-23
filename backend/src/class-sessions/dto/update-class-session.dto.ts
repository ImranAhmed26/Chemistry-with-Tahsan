import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateClassSessionDto {
  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['SCHEDULED', 'COMPLETED', 'CANCELLED'])
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}
