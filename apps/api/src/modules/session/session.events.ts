/**
 * B4 domain events (D-08 / identity spec §9.6).
 *
 * Event names follow the frozen specification's `{Entity}{PastTenseVerb}`
 * convention. Payloads carry only IDs and non-secret metadata — never raw
 * access/refresh tokens, token hashes, or secrets. B4 emits these in-process
 * via EventEmitter2; B5 (P1.7 audit) owns persistent audit consumers.
 */
export const SessionEvents = {
  Created: 'SessionCreated',
  RefreshRotated: 'RefreshRotated',
  RefreshReuseDetected: 'RefreshReuseDetected',
  Logout: 'SessionLogout',
  LogoutAll: 'SessionLogoutAll',
  Revoked: 'SessionRevoked',
  Expired: 'SessionExpired',
} as const;

export interface SessionEventPayload {
  sessionId?: string;
  tenantId: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  correlationId?: string | null;
  reason?: string;
  emittedAt: string;
}