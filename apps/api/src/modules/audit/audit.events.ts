/**
 * B5 (P1.7) audit-relevant auth events (D-08 / identity spec §9.6).
 *
 * Produced in-process via EventEmitter2, consumed by AuditLogConsumer which
 * persists append-only `audit_logs` rows. Event names follow the frozen
 * `{Entity}{PastTenseVerb}` convention. Payloads carry only IDs and
 * non-secret request metadata — never plaintext tokens, hashes or secrets.
 */
export const AuthEvents = {
  LoginSucceeded: 'LoginSucceeded',
  LoginFailed: 'LoginFailed',
  LoginLocked: 'LoginLocked',
  RegistrationSucceeded: 'RegistrationSucceeded',
  EmailVerificationRequested: 'EmailVerificationRequested',
  EmailVerified: 'EmailVerified',
} as const;

interface RequestContextFields {
  ipAddress?: string | null;
  userAgent?: string | null;
  correlationId?: string | null;
}

export interface LoginSucceededPayload extends RequestContextFields {
  tenantId: string;
  userId: string;
  actorEmail: string;
  emittedAt: string;
}

export interface LoginFailedPayload extends RequestContextFields {
  tenantId: string | null;
  actorEmail: string;
  reason: string;
  emittedAt: string;
}

export interface LoginLockedPayload extends RequestContextFields {
  tenantId: string;
  actorEmail: string;
  emittedAt: string;
}

export interface RegistrationSucceededPayload extends RequestContextFields {
  tenantId: string;
  userId: string;
  actorEmail: string;
  role: string | null;
  emittedAt: string;
}

export interface EmailVerificationRequestedPayload {
  tenantId: string;
  userId: string;
  actorEmail: string;
  emittedAt: string;
}

export interface EmailVerifiedPayload {
  tenantId: string;
  userId: string;
  actorEmail: string;
  emittedAt: string;
}

export type AuditEventPayload =
  | LoginSucceededPayload
  | LoginFailedPayload
  | LoginLockedPayload
  | RegistrationSucceededPayload
  | EmailVerificationRequestedPayload
  | EmailVerifiedPayload;