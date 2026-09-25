import { EventPublisher } from '../events/event-publisher';
import { EventEnvelopeFields } from '../events/event-envelope';
import { AuditService } from '../audit/audit.service';
import { Prisma } from '@prisma/client';
import { generateEventId } from '../events/event-envelope';

/**
 * P5 — Academic Management domain events (D-4 envelope-aware).
 *
 * Every mutation stamps one eventId shared by the emitted event AND the audit
 * row, so the 72-hour dedup collapses duplicate deliveries of the same logical
 * occurrence. Payloads are emitted ADDITIVELY on top of the envelope fields;
 * producers never include eventId/causationId/schemaVersion/emittedAt/
 * tenantId themselves.
 */
export const AcademicsEvents = {
  // Calendar
  YearCreated: 'academics.year.created',
  YearUpdated: 'academics.year.updated',
  YearActivated: 'academics.year.activated',
  YearClosed: 'academics.year.closed',
  YearDeleted: 'academics.year.deleted',
  SessionCreated: 'academics.session.created',
  SessionUpdated: 'academics.session.updated',
  SessionActivated: 'academics.session.activated',
  SessionClosed: 'academics.session.closed',
  SessionDeleted: 'academics.session.deleted',
  TermCreated: 'academics.term.created',
  TermUpdated: 'academics.term.updated',
  TermActivated: 'academics.term.activated',
  TermClosed: 'academics.term.closed',
  TermDeleted: 'academics.term.deleted',

  // Curriculum
  DepartmentCreated: 'academics.department.created',
  DepartmentUpdated: 'academics.department.updated',
  DepartmentDeleted: 'academics.department.deleted',
  SubjectCreated: 'academics.subject.created',
  SubjectUpdated: 'academics.subject.updated',
  SubjectActivated: 'academics.subject.activated',
  SubjectDeactivated: 'academics.subject.deactivated',
  SubjectDeleted: 'academics.subject.deleted',
  SubjectGroupCreated: 'academics.subject-group.created',
  SubjectGroupUpdated: 'academics.subject-group.updated',
  SubjectGroupSubjectAdded: 'academics.subject-group.subject-added',
  SubjectGroupSubjectRemoved: 'academics.subject-group.subject-removed',
  SubjectGroupDeleted: 'academics.subject-group.deleted',
  GradeLevelCreated: 'academics.grade-level.created',
  GradeLevelUpdated: 'academics.grade-level.updated',
  GradeLevelDeleted: 'academics.grade-level.deleted',
  StreamCreated: 'academics.stream.created',
  StreamUpdated: 'academics.stream.updated',
  StreamDeleted: 'academics.stream.deleted',
  ClassCreated: 'academics.class.created',
  ClassUpdated: 'academics.class.updated',
  ClassActivated: 'academics.class.activated',
  ClassDeactivated: 'academics.class.deactivated',
  ClassDeleted: 'academics.class.deleted',

  // Teaching assignments / homeroom / arms
  TeachingCreated: 'academics.teaching.created',
  TeachingUpdated: 'academics.teaching.updated',
  TeachingDeleted: 'academics.teaching.deleted',
  HomeroomAssigned: 'academics.homeroom.assigned',
  HomeroomChanged: 'academics.homeroom.changed',
  ArmCreated: 'academics.arm.created',
  ArmUpdated: 'academics.arm.updated',
  ArmDeleted: 'academics.arm.deleted',

  // Timetable
  TimetableCreated: 'academics.timetable.created',
  TimetableUpdated: 'academics.timetable.updated',
  TimetablePublished: 'academics.timetable.published',
  TimetableArchived: 'academics.timetable.archived',
  TimetableDeleted: 'academics.timetable.deleted',
  TimetableSlotAdded: 'academics.timetable.slot-added',
  TimetableSlotUpdated: 'academics.timetable.slot-updated',
  TimetableSlotRemoved: 'academics.timetable.slot-removed',

  // Enrollment + subject registration
  EnrollmentCreated: 'academics.enrollment.created',
  EnrollmentUpdated: 'academics.enrollment.updated',
  EnrollmentWithdrawn: 'academics.enrollment.withdrawn',
  EnrollmentTransferred: 'academics.enrollment.transferred',
  EnrollmentDeleted: 'academics.enrollment.deleted',
  SubjectRegistered: 'academics.subject-registration.registered',
  SubjectUnregistered: 'academics.subject-registration.unregistered',
  SubjectRegistrationUpdated: 'academics.subject-registration.updated',

  // Attendance
  AttendanceRecorded: 'academics.attendance.recorded',
  AttendanceCorrected: 'academics.attendance.corrected',

  // Assignments
  AssignmentCreated: 'academics.assignment.created',
  AssignmentUpdated: 'academics.assignment.updated',
  AssignmentPublished: 'academics.assignment.published',
  AssignmentClosed: 'academics.assignment.closed',
  AssignmentDeleted: 'academics.assignment.deleted',
  SubmissionSubmitted: 'academics.submission.submitted',
  SubmissionGraded: 'academics.submission.graded',

  // Assessments
  AssessmentCreated: 'academics.assessment.created',
  AssessmentUpdated: 'academics.assessment.updated',
  AssessmentPublished: 'academics.assessment.published',
  AssessmentDeleted: 'academics.assessment.deleted',
  AssessmentResultRecorded: 'academics.assessment-result.recorded',

  // Grading
  GradeScaleCreated: 'academics.grade-scale.created',
  GradeScaleUpdated: 'academics.grade-scale.updated',
  GradeScaleActivated: 'academics.grade-scale.activated',
  GradeScaleDeleted: 'academics.grade-scale.deleted',
  GradeBoundaryAdded: 'academics.grade-boundary.added',
  GradeBoundaryUpdated: 'academics.grade-boundary.updated',
  GradeBoundaryRemoved: 'academics.grade-boundary.removed',
  RemarkAdded: 'academics.remark.added',
  RemarkUpdated: 'academics.remark.updated',
  RemarkRemoved: 'academics.remark.removed',

  // Results + report cards
  ResultCompiled: 'academics.result.compiled',
  ResultApproved: 'academics.result.approved',
  ResultPublished: 'academics.result.published',
  ReportCardGenerated: 'academics.report-card.generated',
  ReportCardPublished: 'academics.report-card.published',

  // Progression
  ProgressionEvaluated: 'academics.progression.evaluated',
  ProgressionApproved: 'academics.progression.approved',
  ProgressionDeleted: 'academics.progression.deleted',

  // Policy
  PolicyCreated: 'academics.policy.created',
  PolicyUpdated: 'academics.policy.updated',
  PolicyPublished: 'academics.policy.published',
  PolicyDeleted: 'academics.policy.deleted',

  // Summer school
  SummerSchoolSessionCreated: 'academics.summer-school.session-created',
  SummerSchoolSessionUpdated: 'academics.summer-school.session-updated',
  SummerSchoolSessionStaged: 'academics.summer-school.session-staged',
  SummerSchoolSessionDeleted: 'academics.summer-school.session-deleted',
  SummerSchoolRegistered: 'academics.summer-school.registered',
  SummerSchoolRegistrationUpdated: 'academics.summer-school.registration-updated',
  SummerSchoolResultRecorded: 'academics.summer-school.result-recorded',
  SummerSchoolResultPublished: 'academics.summer-school.result-published',
} as const;

export type AcademicsEventName = (typeof AcademicsEvents)[keyof typeof AcademicsEvents];

export type AcademicEventPayload = {
  tenantId: string;
  entityType: string;
  entityId: string;
  actorId?: string | null;
  institutionId?: string;
  causationId?: string | null;
} & EventEnvelopeFields &
  Record<string, unknown>;

export interface EmitAcademicEventOptions {
  tenantId: string;
  institutionId: string;
  entityType: string;
  entityId: string;
  actorId?: string | null;
  causationId?: string | null;
  changes?: Prisma.InputJsonValue | null;
  payload?: Record<string, unknown>;
}

/**
 * Emits an envelope-aware academic event AND persists a linked audit row,
 * sharing one eventId so the D-4 dedicated audit dedup collapses redeliveries
 * to a single row. Returns the generated eventId.
 */
export async function emitAudited(
  publisher: EventPublisher,
  audit: AuditService,
  event: AcademicsEventName,
  options: EmitAcademicEventOptions,
): Promise<string> {
  const eventId = generateEventId();
  publisher.publish<AcademicEventPayload>(event, options.tenantId, {
    entityType: options.entityType,
    entityId: options.entityId,
    actorId: options.actorId ?? null,
    institutionId: options.institutionId,
    causationId: options.causationId ?? null,
    ...(options.payload ?? {}),
  }, { eventId, causationId: options.causationId ?? null });

  await audit.record({
    tenantId: options.tenantId,
    actorId: options.actorId ?? null,
    action: event,
    entityType: options.entityType,
    entityId: options.entityId,
    changes: options.changes ?? undefined,
    eventId,
  });
  return eventId;
}