import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
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
import { PeopleEvents, PeopleEventPayload } from '../people/people.events';

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

  // ---- PEOPLE-2 (BR-020) ---------------------------------------------------

  @OnEvent(PeopleEvents.PersonCreated, { async: true })
  handlePersonCreated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.person.created',
        entityType: 'person',
        entityId: payload.entityId,
        changes: { version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.PersonUpdated, { async: true })
  handlePersonUpdated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.person.updated',
        entityType: 'person',
        entityId: payload.entityId,
        changes: (payload.changes ?? { version: payload.version }) as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.PersonSoftDeleted, { async: true })
  handlePersonSoftDeleted(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.person.soft_deleted',
        entityType: 'person',
        entityId: payload.entityId,
        changes: { version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.PersonRestored, { async: true })
  handlePersonRestored(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.person.restored',
        entityType: 'person',
        entityId: payload.entityId,
        changes: { version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.StudentEnrolled, { async: true })
  handleStudentEnrolled(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.student.enrolled',
        entityType: 'student',
        entityId: payload.entityId,
        changes: { personId: payload.personId, version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.StudentUpdated, { async: true })
  handleStudentUpdated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.student.updated',
        entityType: 'student',
        entityId: payload.entityId,
        changes: (payload.changes ?? { version: payload.version }) as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.StudentGraduated, { async: true })
  handleStudentGraduated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.student.graduated',
        entityType: 'student',
        entityId: payload.entityId,
        changes: { personId: payload.personId, version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.StudentTransferred, { async: true })
  handleStudentTransferred(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.student.transferred',
        entityType: 'student',
        entityId: payload.entityId,
        changes: { personId: payload.personId, version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.StudentWithdrawn, { async: true })
  handleStudentWithdrawn(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.student.withdrawn',
        entityType: 'student',
        entityId: payload.entityId,
        changes: { personId: payload.personId, version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  // ---- PEOPLE-3 (BR-020) ---------------------------------------------------

  @OnEvent(PeopleEvents.StaffHired, { async: true })
  handleStaffHired(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.staff.hired',
        entityType: 'staff',
        entityId: payload.entityId,
        changes: { personId: payload.personId, version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.StaffUpdated, { async: true })
  handleStaffUpdated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.staff.updated',
        entityType: 'staff',
        entityId: payload.entityId,
        changes: (payload.changes ?? { personId: payload.personId, version: payload.version }) as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.StaffSeparated, { async: true })
  handleStaffSeparated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.staff.separated',
        entityType: 'staff',
        entityId: payload.entityId,
        changes: (payload.changes ?? { personId: payload.personId, version: payload.version }) as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  // ---- PEOPLE-4 (BR-020) ---------------------------------------------------

  @OnEvent(PeopleEvents.ParentCreated, { async: true })
  handleParentCreated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.parent.created',
        entityType: 'parent',
        entityId: payload.entityId,
        changes: { personId: payload.personId, version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.ParentUpdated, { async: true })
  handleParentUpdated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.parent.updated',
        entityType: 'parent',
        entityId: payload.entityId,
        changes: (payload.changes ?? { personId: payload.personId, version: payload.version }) as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.GuardianCreated, { async: true })
  handleGuardianCreated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.guardian.created',
        entityType: 'guardian',
        entityId: payload.entityId,
        changes: { personId: payload.personId, version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.GuardianUpdated, { async: true })
  handleGuardianUpdated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.guardian.updated',
        entityType: 'guardian',
        entityId: payload.entityId,
        changes: (payload.changes ?? { personId: payload.personId, version: payload.version }) as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.EmergencyContactCreated, { async: true })
  handleEmergencyContactCreated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.emergency_contact.created',
        entityType: 'emergency_contact',
        entityId: payload.entityId,
        changes: { personId: payload.personId, version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.EmergencyContactUpdated, { async: true })
  handleEmergencyContactUpdated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.emergency_contact.updated',
        entityType: 'emergency_contact',
        entityId: payload.entityId,
        changes: (payload.changes ?? { personId: payload.personId, version: payload.version }) as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.EmergencyContactRemoved, { async: true })
  handleEmergencyContactRemoved(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.emergency_contact.removed',
        entityType: 'emergency_contact',
        entityId: payload.entityId,
        changes: (payload.changes ?? { personId: payload.personId, version: payload.version }) as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.PersonRelationshipCreated, { async: true })
  handlePersonRelationshipCreated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.person_relationship.created',
        entityType: 'person_relationship',
        entityId: payload.entityId,
        changes: { version: payload.version, ...(payload.changes ?? {}) } as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.PersonRelationshipUpdated, { async: true })
  handlePersonRelationshipUpdated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.person_relationship.updated',
        entityType: 'person_relationship',
        entityId: payload.entityId,
        changes: (payload.changes ?? { version: payload.version }) as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.PersonRelationshipRevoked, { async: true })
  handlePersonRelationshipRevoked(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.person_relationship.revoked',
        entityType: 'person_relationship',
        entityId: payload.entityId,
        changes: (payload.changes ?? { personId: payload.personId, version: payload.version }) as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  // ---- PEOPLE-5 (BR-020) ---------------------------------------------------

  @OnEvent(PeopleEvents.ApplicantCreated, { async: true })
  handleApplicantCreated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.applicant.created',
        entityType: 'applicant',
        entityId: payload.entityId,
        changes: { personId: payload.personId, version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.ApplicantUpdated, { async: true })
  handleApplicantUpdated(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.applicant.updated',
        entityType: 'applicant',
        entityId: payload.entityId,
        changes: (payload.changes ?? { personId: payload.personId, version: payload.version }) as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.ApplicantAccepted, { async: true })
  handleApplicantAccepted(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.applicant.accepted',
        entityType: 'applicant',
        entityId: payload.entityId,
        changes: { personId: payload.personId, version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.ApplicantRejected, { async: true })
  handleApplicantRejected(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.applicant.rejected',
        entityType: 'applicant',
        entityId: payload.entityId,
        changes: (payload.changes ?? { personId: payload.personId, version: payload.version }) as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.ApplicantExpired, { async: true })
  handleApplicantExpired(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.applicant.expired',
        entityType: 'applicant',
        entityId: payload.entityId,
        changes: { personId: payload.personId, version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.PeopleDocumentUploaded, { async: true })
  handlePeopleDocumentUploaded(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.people_document.uploaded',
        entityType: 'people_document',
        entityId: payload.entityId,
        changes: { personId: payload.personId, version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.PeopleDocumentRemoved, { async: true })
  handlePeopleDocumentRemoved(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.people_document.removed',
        entityType: 'people_document',
        entityId: payload.entityId,
        changes: { personId: payload.personId, version: payload.version },
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }

  @OnEvent(PeopleEvents.PersonMerged, { async: true })
  handlePersonMerged(payload: PeopleEventPayload) {
    return this.safe(
      this.audit.record({
        tenantId: payload.tenantId,
        actorId: payload.actorId,
        actorEmail: payload.actorEmail,
        action: 'people.person.merged',
        entityType: 'person',
        entityId: payload.entityId,
        changes: (payload.changes ?? { personId: payload.personId, version: payload.version }) as Prisma.InputJsonValue,
        contextIp: null,
        contextUserAgent: null,
        correlationId: payload.correlationId,
      }),
    );
  }
}