import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async getTenant(slug: string) {
    const tenant = await this.findActiveTenantOrThrow(slug);
    return {
      brandName: tenant.brandName,
      ownerName: tenant.ownerName,
      bio: tenant.bio,
      photoUrl: tenant.photoUrl,
      phone: tenant.phone,
      whatsapp: tenant.whatsapp,
      email: tenant.email,
      address: tenant.address,
      facebookUrl: tenant.facebookUrl,
      instagramUrl: tenant.instagramUrl,
      youtubeUrl: tenant.youtubeUrl,
    };
  }

  async getCourses(slug: string) {
    const tenant = await this.findActiveTenantOrThrow(slug);
    return this.prisma.course.findMany({
      where: { tenantId: tenant.id, status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        academicLevel: true,
        examBoard: true,
        description: true,
        batches: {
          where: { status: { in: ['UPCOMING', 'ONGOING'] } },
          select: { id: true, name: true, schedule: true, status: true },
        },
      },
    });
  }

  async getResources(slug: string) {
    const tenant = await this.findActiveTenantOrThrow(slug);
    return this.getPublishedPublicResources(tenant.id);
  }

  private getPublishedPublicResources(tenantId: string) {
    return this.prisma.resource.findMany({
      where: { tenantId, visibility: 'PUBLIC', status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async findActiveTenantOrThrow(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant || !tenant.isActive) throw new NotFoundException('Tenant not found');
    return tenant;
  }
}
