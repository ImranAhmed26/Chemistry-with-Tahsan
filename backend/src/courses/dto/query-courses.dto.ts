import { IsIn, IsOptional } from 'class-validator';

export class QueryCoursesDto {
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
