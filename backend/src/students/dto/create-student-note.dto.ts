import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStudentNoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
