import { IsDateString, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBatchDto {
  @IsString()
  courseId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsIn(['UPCOMING', 'ONGOING', 'COMPLETED', 'ARCHIVED'])
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED';
}
