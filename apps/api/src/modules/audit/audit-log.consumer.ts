import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditService } from './audit.service';
import {
  AuthEvents,
  EmailVerificationRequestedPayload,
  EmailVerifiedPayload,
  LoginFailedPayload,
  LoginLockedPayload,
  LoginSucceededPayload,
  RegistrationSucceededPayload,
} from './audit.events';

/**
 * Persists audit-relevant auth events as append-only `audit_logs` rows.
 *
 * Runs after the emitting service's DB writes have committed (producers emit
 * post-transaction). A persistence failure is logged, never propagated to the
 * request that triggered the event: the audit trail must not become an
 * availability dependency of authentication.
 */
@Injectable()
export class AuditLogConsumer {
  private readonly logger = new Logger(AuditLogConsumer.name);

  constructor(private readonly audit: AuditService) {}

  private async safe(promise: Promise<void>): Promise<void> {
    try {
      await promise;
    } catch (err) {
      this.logger.error(`Failed to persist audit row: ${String(err)}`);
    }
  }

  @OnEvent(AuthEvents.LoginSucceeded, { async: true })
  handleLoginSucceeded(payload: LoginSucceededPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.userId,
        actorEmail: payload.actorEmail,
        action: 'auth.login.succeeded',
        entityType: 'user',
        entityId: payload.userId,
        changes: { method: 'password' },
        contextIp: payload.ipAddress,
        contextUserAgent: payload.userAgent,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(AuthEvents.LoginFailed, { async: true })
  handleLoginFailed(payload: LoginFailedPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorEmail: payload.actorEmail,
        action: 'auth.login.failed',
        entityType: 'auth',
        entityId: null,
        changes: { reason: payload.reason },
        contextIp: payload.ipAddress,
        contextUserAgent: payload.userAgent,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(AuthEvents.LoginLocked, { async: true })
  handleLoginLocked(payload: LoginLockedPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorEmail: payload.actorEmail,
        action: 'auth.login.locked',
        entityType: 'auth',
        entityId: null,
        contextIp: payload.ipAddress,
        contextUserAgent: payload.userAgent,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(AuthEvents.RegistrationSucceeded, { async: true })
  handleRegistrationSucceeded(payload: RegistrationSucceededPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.userId,
        actorEmail: payload.actorEmail,
        action: 'auth.registration.succeeded',
        entityType: 'user',
        entityId: payload.userId,
        changes: { role: payload.role },
        contextIp: payload.ipAddress,
        contextUserAgent: payload.userAgent,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(AuthEvents.EmailVerificationRequested, { async: true })
  handleVerificationRequested(payload: EmailVerificationRequestedPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.userId,
        actorEmail: payload.actorEmail,
        action: 'auth.email.verification_requested',
        entityType: 'user',
        entityId: payload.userId,
        contextIp: null,
        contextUserAgent: null,
        correlationId: null,
      }),
    );
  }

  @OnEvent(AuthEvents.EmailVerified, { async: true })
  handleEmailVerified(payload: EmailVerifiedPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.userId,
        actorEmail: payload.actorEmail,
        action: 'auth.email.verified',
        entityType: 'user',
        entityId: payload.userId,
        contextIp: null,
        contextUserAgent: null,
        correlationId: null,
      }),
    );
  }
}