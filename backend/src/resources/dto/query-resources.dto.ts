import { IsIn, IsOptional, IsString } from 'class-validator';

const RESOURCE_TYPES = ['NOTES', 'PDF_BOOK', 'QUESTION_PAPER', 'REVISION_MAP', 'EXAM_PACK', 'RECORDED_LECTURE'];
const VISIBILITIES = ['PUBLIC', 'ENROLLED_ONLY', 'PRIVATE'];
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

export class QueryResourcesDto {
  @IsOptional()
  @IsIn(RESOURCE_TYPES)
  type?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsIn(VISIBILITIES)
  visibility?: string;
}
