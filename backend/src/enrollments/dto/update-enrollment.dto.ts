import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsIn(['ACTIVE', 'COMPLETED', 'WITHDRAWN'])
  status?: 'ACTIVE' | 'COMPLETED' | 'WITHDRAWN';

  @IsOptional()
  @IsDateString()
  endedAt?: string;
}
