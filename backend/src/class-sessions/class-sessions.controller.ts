import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { ClassSessionsService } from './class-sessions.service';
import { CreateClassSessionDto } from './dto/create-class-session.dto';
import { UpdateClassSessionDto } from './dto/update-class-session.dto';
import { QueryClassSessionsDto } from './dto/query-class-sessions.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@UseGuards(JwtAuthGuard)
@Controller('class-sessions')
export class ClassSessionsController {
  constructor(private readonly classSessionsService: ClassSessionsService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() query: QueryClassSessionsDto) {
    return this.classSessionsService.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.classSessionsService.findOne(tenantId, id);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateClassSessionDto) {
    return this.classSessionsService.create(tenantId, dto);
  }

  @Patch(':id')
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateClassSessionDto) {
    return this.classSessionsService.update(tenantId, id, dto);
  }

  @Get(':id/attendance')
  getAttendance(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.classSessionsService.getAttendance(tenantId, id);
  }

  @Put(':id/attendance')
  markAttendance(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: MarkAttendanceDto,
  ) {
    return this.classSessionsService.markAttendance(tenantId, id, dto);
  }
}
