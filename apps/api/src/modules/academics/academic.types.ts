/**
 * P5 — Academic Management trusted identity context, resolved by the guards
 * from the JWT (never from client input).
 */
export interface AcademicContext {
  tenantId: string;
  institutionId?: string;
  userId: string;
  personId?: string;
}

export interface AuthUser {
  sub: string;
  tenantId: string;
  institutionId?: string;
  email?: string;
  personId?: string;
  orgId?: string;
}

/**
 * Normalizes the JWT identity (req.user, guarded + tenant-scoped) into the
 * trusted AcademicContext consumed by services. `sub` is the user id; a
 * person identity is resolved by services when the JWT lacks `personId`
 * (P5.3.4.2 — staff resolved via userId → staff.personId, ACTIVE).
 */
export function toAcademicContext(user: {
  sub: string;
  tenantId: string;
  institutionId?: string;
  personId?: string;
}): AcademicContext {
  return {
    userId: user.sub,
    tenantId: user.tenantId,
    institutionId: user.institutionId,
    personId: user.personId,
  };
}