import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Shortcut for the common case of only needing the tenant id:
// @CurrentTenant() tenantId: string
// This is the ONLY place a feature service should get a tenantId from — never
// hardcode one, and never trust a tenantId supplied by the client.
export const CurrentTenant = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  return request.user?.tenantId;
});
