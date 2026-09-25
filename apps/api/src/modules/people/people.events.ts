/**
 * PEOPLE-2/PEOPLE-3 domain events (People spec §5.8, BR-020).
 *
 * Produced in-process via EventEmitter2 post-transaction, consumed by
 * AuditModule (append-only `audit_logs` rows). Event names follow the frozen
 * `{Entity}{PastTenseVerb}` convention. Payloads carry only IDs and non-secret
 * request metadata — never API keys, tokens, hashes or full PII bodies.
 */
import { EventEnvelopeFields } from '../events/event-envelope';

export const PeopleEvents = {
  PersonCreated: 'PersonCreated',
  PersonUpdated: 'PersonUpdated',
  PersonSoftDeleted: 'PersonSoftDeleted',
  PersonRestored: 'PersonRestored',
  StudentEnrolled: 'StudentEnrolled',
  StudentUpdated: 'StudentUpdated',
  StudentGraduated: 'StudentGraduated',
  StudentTransferred: 'StudentTransferred',
  StudentWithdrawn: 'StudentWithdrawn',
  StaffHired: 'StaffHired',
  StaffUpdated: 'StaffUpdated',
  StaffSeparated: 'StaffSeparated',
  // PEOPLE-4
  ParentCreated: 'ParentCreated',
  ParentUpdated: 'ParentUpdated',
  GuardianCreated: 'GuardianCreated',
  GuardianUpdated: 'GuardianUpdated',
  EmergencyContactCreated: 'EmergencyContactCreated',
  EmergencyContactUpdated: 'EmergencyContactUpdated',
  EmergencyContactRemoved: 'EmergencyContactRemoved',
  PersonRelationshipCreated: 'PersonRelationshipCreated',
  PersonRelationshipUpdated: 'PersonRelationshipUpdated',
  PersonRelationshipRevoked: 'PersonRelationshipRevoked',
  // PEOPLE-5
  ApplicantCreated: 'ApplicantCreated',
  ApplicantUpdated: 'ApplicantUpdated',
  ApplicantAccepted: 'ApplicantAccepted',
  ApplicantRejected: 'ApplicantRejected',
  ApplicantExpired: 'ApplicantExpired',
  PeopleDocumentUploaded: 'PeopleDocumentUploaded',
  PeopleDocumentRemoved: 'PeopleDocumentRemoved',
  PersonMerged: 'PersonMerged',
} as const;

export interface PeopleEventPayload extends EventEnvelopeFields {
  tenantId: string;
  actorId?: string | null;
  actorEmail?: string | null;
  personId?: string;
  entityId: string;
  version?: number;
  changes?: Record<string, unknown>;
  correlationId?: string | null;
}