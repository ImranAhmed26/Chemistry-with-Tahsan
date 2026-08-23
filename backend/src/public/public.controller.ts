import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicService } from './public.service';
import { QueryPublicResourcesDto } from './dto/query-public-resources.dto';

// No JwtAuthGuard here — this module serves the unauthenticated marketing site.
// Every method still takes a tenant slug explicitly (route param or query
// param) and resolves it to a tenant server-side; nothing is ever hardcoded.
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('tenant/:slug')
  getTenant(@Param('slug') slug: string) {
    return this.publicService.getTenant(slug);
  }

  @Get('tenant/:slug/courses')
  getCourses(@Param('slug') slug: string) {
    return this.publicService.getCourses(slug);
  }

  @Get('tenant/:slug/resources')
  getResourcesForTenant(@Param('slug') slug: string) {
    return this.publicService.getResources(slug);
  }

  // Convenience alias matching the PDF Store / Free Resources page contract;
  // requires ?slug= since there is no route param to carry the tenant here.
  @Get('resources')
  getResources(@Query() query: QueryPublicResourcesDto) {
    return this.publicService.getResources(query.slug);
  }
}
