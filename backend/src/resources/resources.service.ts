import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ResourceStatus, ResourceType, ResourceVisibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { QueryResourcesDto } from './dto/query-resources.dto';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, query: QueryResourcesDto) {
    const where: Prisma.ResourceWhereInput = { tenantId };
    if (query.type) where.type = query.type as ResourceType;
    if (query.courseId) where.courseId = query.courseId;
    if (query.status) where.status = query.status as ResourceStatus;
    if (query.visibility) where.visibility = query.visibility as ResourceVisibility;

    const [data, total] = await Promise.all([
      this.prisma.resource.findMany({ where, orderBy: { createdAt: 'desc' } }),
      this.prisma.resource.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(tenantId: string, id: string) {
    const resource = await this.prisma.resource.findFirst({ where: { id, tenantId } });
    if (!resource) throw new NotFoundException('Resource not found');
    return resource;
  }

  create(tenantId: string, dto: CreateResourceDto) {
    return this.prisma.resource.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description,
        type: dto.type as ResourceType,
        subject: dto.subject,
        courseId: dto.courseId,
        chapterTopic: dto.chapterTopic,
        fileUrl: dto.fileUrl,
        coverImageUrl: dto.coverImageUrl,
        visibility: dto.visibility as ResourceVisibility | undefined,
        price: dto.price,
        status: dto.status as ResourceStatus | undefined,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateResourceDto) {
    await this.findOne(tenantId, id);
    return this.prisma.resource.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type as ResourceType | undefined,
        subject: dto.subject,
        courseId: dto.courseId,
        chapterTopic: dto.chapterTopic,
        fileUrl: dto.fileUrl,
        coverImageUrl: dto.coverImageUrl,
        visibility: dto.visibility as ResourceVisibility | undefined,
        price: dto.price,
        status: dto.status as ResourceStatus | undefined,
      },
    });
  }
}
