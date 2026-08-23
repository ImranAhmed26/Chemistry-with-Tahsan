import { IsOptional, IsString } from 'class-validator';

export class QueryPublicResourcesDto {
  // Required so this route never falls back to guessing which tenant to serve —
  // the frontend passes the tenant's public slug explicitly, just like the
  // /api/public/tenant/:slug routes do.
  @IsString()
  slug: string;
}
