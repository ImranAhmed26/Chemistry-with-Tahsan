import { IsIn, IsOptional, IsString } from 'class-validator';

export class QueryBatchesDto {
  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsIn(['UPCOMING', 'ONGOING', 'COMPLETED', 'ARCHIVED'])
  status?: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED';
}
