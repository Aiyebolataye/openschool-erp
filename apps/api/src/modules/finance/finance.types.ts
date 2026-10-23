/**
 * P6.1 — Finance trusted identity context, resolved by the guards from the JWT
 * (never from client input).
 */
export interface FinanceContext {
  tenantId: string;
  institutionId?: string;
  userId: string;
}

export interface AuthUser {
  sub: string;
  tenantId: string;
  institutionId?: string;
  email?: string;
  orgId?: string;
}

/**
 * Normalizes the JWT identity (req.user, guarded + tenant-scoped) into the
 * trusted FinanceContext consumed by services. Tenant and institution are
 * always taken from the signed token, never from request body or query.
 */
export function toFinanceContext(user: {
  sub: string;
  tenantId: string;
  institutionId?: string;
}): FinanceContext {
  return {
    userId: user.sub,
    tenantId: user.tenantId,
    institutionId: user.institutionId,
  };
}
