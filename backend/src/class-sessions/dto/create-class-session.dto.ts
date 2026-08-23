import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateClassSessionDto {
  @IsString()
  batchId: string;

  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

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
