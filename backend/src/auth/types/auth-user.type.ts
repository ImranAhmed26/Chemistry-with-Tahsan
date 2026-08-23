// Shape attached to `req.user` after JWT validation, and the JWT payload itself.
// `tenantId` is the single source of truth for tenant scoping — every feature
// service must take it as a parameter and filter every query by it. Never read
// a tenant id from a route param or request body.
export interface AuthUser {
  userId: string;
  tenantId: string;
  email: string;
  role: 'OWNER' | 'STAFF';
}

export interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: 'OWNER' | 'STAFF';
}
