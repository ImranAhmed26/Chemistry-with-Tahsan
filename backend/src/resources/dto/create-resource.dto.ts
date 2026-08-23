import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

const RESOURCE_TYPES = ['NOTES', 'PDF_BOOK', 'QUESTION_PAPER', 'REVISION_MAP', 'EXAM_PACK', 'RECORDED_LECTURE'];
const VISIBILITIES = ['PUBLIC', 'ENROLLED_ONLY', 'PRIVATE'];
const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

export class CreateResourceDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(RESOURCE_TYPES)
  type: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  chapterTopic?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsIn(VISIBILITIES)
  visibility?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;
}
