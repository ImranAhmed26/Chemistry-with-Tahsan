import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { CreateStudentNoteDto } from './dto/create-student-note.dto';

@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() query: QueryStudentsDto) {
    return this.studentsService.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.studentsService.findOne(tenantId, id);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateStudentDto) {
    return this.studentsService.create(tenantId, dto);
  }

  @Patch(':id')
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(tenantId, id, dto);
  }

  @Patch(':id/archive')
  archive(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.studentsService.archive(tenantId, id);
  }

  @Patch(':id/reactivate')
  reactivate(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.studentsService.reactivate(tenantId, id);
  }

  @Post(':id/notes')
  addNote(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateStudentNoteDto,
  ) {
    return this.studentsService.addNote(tenantId, id, user.userId, dto);
  }
}
