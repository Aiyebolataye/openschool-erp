/**
 * PEOPLE-2 student lifecycle transitions (People spec §5.6).
 *
 * Enrolled → Active → (Transferred) → (Withdrawn) → (Graduated)
 *
 * Graduation, transfer and withdrawal are terminal: once applied the student
 * record is no longer mutable via the enrollment-detail endpoint. Re-enrolment
 * of a graduated/withdrawn/transferred student is a future-batch concern
 * (fresh Student record), so those transitions close the cycle.
 */

export const STUDENT_GRADUATE_FROM = ['ENROLLED', 'ACTIVE'] as const;
export const STUDENT_TRANSFER_FROM = ['ENROLLED', 'ACTIVE'] as const;
export const STUDENT_WITHDRAW_FROM = ['ENROLLED', 'ACTIVE'] as const;

export type StudentStatusValue =
  | 'ENROLLED'
  | 'ACTIVE'
  | 'TRANSFERRED'
  | 'WITHDRAWN'
  | 'GRADUATED';

export function canGraduate(status: StudentStatusValue): boolean {
  return (STUDENT_GRADUATE_FROM as readonly string[]).includes(status);
}

export function canTransfer(status: StudentStatusValue): boolean {
  return (STUDENT_TRANSFER_FROM as readonly string[]).includes(status);
}

export function canWithdraw(status: StudentStatusValue): boolean {
  return (STUDENT_WITHDRAW_FROM as readonly string[]).includes(status);
}

/** Enrollment detail is only mutable for a currently enrolled/active student. */
export function isMutableEnrollment(status: StudentStatusValue): boolean {
  return status === 'ENROLLED' || status === 'ACTIVE';
}

/**
 * Allowed generic status transitions via the student PATCH endpoint
 * (spec §5.6): same-state stay, or the single forward ENROLLED → ACTIVE
 * move. Terminal states (GRADUATED / TRANSFERRED / WITHDRAWN) are immutable
 * here — re-enrolment is a fresh-record (future batch) concern.
 */
export function canPatchStatus(
  from: StudentStatusValue,
  to: StudentStatusValue,
): boolean {
  if (from === to) {
    return true;
  }
  return from === 'ENROLLED' && to === 'ACTIVE';
}

// ---- PEOPLE-3 staff lifecycle --------------------------------------------

export const STAFF_ACTIVATABLE_FROM = ['HIRED'] as const;
export const STAFF_LEAVE_FROM = ['ACTIVE'] as const;
export const STAFF_RETURN_FROM = ['ON_LEAVE'] as const;
export const STAFF_SEPARATE_FROM = ['HIRED', 'ACTIVE', 'ON_LEAVE'] as const;

export type StaffStatusValue =
  | 'HIRED'
  | 'ACTIVE'
  | 'ON_LEAVE'
  | 'SEPARATED';

/**
 * Allowed staff status transitions (People spec §5.6 / V-ST-08):
 *   HIRED → ACTIVE → ON_LEAVE → ACTIVE → SEPARATED
 *   HIRED / ON_LEAVE → SEPARATED
 * SEPARATED is terminal, same as the student terminal-state rule — no
 * transition may leave it.
 */
export function canPatchStaffStatus(
  from: StaffStatusValue,
  to: StaffStatusValue,
): boolean {
  if (from === 'SEPARATED') {
    return from === to;
  }
  if (from === to) {
    return true;
  }
  if (to === 'ACTIVE') {
    return from === 'HIRED' || from === 'ON_LEAVE';
  }
  if (to === 'ON_LEAVE') {
    return from === 'ACTIVE';
  }
  if (to === 'SEPARATED') {
    return (STAFF_SEPARATE_FROM as readonly string[]).includes(from);
  }
  return false;
}

/** Current employment detail is only mutable for a non-separated staff member. */
export function isMutableEmployment(status: StaffStatusValue): boolean {
  return status !== 'SEPARATED';
}

// ---- PEOPLE-4 parent / guardian lifecycle ---------------------------------

/**
 * Parent/Guardian ACTIVE ↔ INACTIVE (People spec §5.6):
 *   Created → Active → (Inactive) → Active
 *
 * Both ParentStatus and GuardianStatus share the same toggle shape.
 */
export type ParentStatusValue = 'ACTIVE' | 'INACTIVE';
export type GuardianStatusValue = 'ACTIVE' | 'INACTIVE';

export function canPatchParentStatus(
  from: ParentStatusValue,
  to: ParentStatusValue,
): boolean {
  if (from === to) return true;
  return from === 'ACTIVE' && to === 'INACTIVE';
}

export function canPatchGuardianStatus(
  from: GuardianStatusValue,
  to: GuardianStatusValue,
): boolean {
  if (from === to) return true;
  return from === 'ACTIVE' && to === 'INACTIVE';
}

export type RelationshipTypeValue =
  | 'PARENT'
  | 'GUARDIAN'
  | 'SIBLING'
  | 'EMERGENCY_CONTACT'
  | 'AUTHORIZED_PICKUP'
  | 'STAFF_STUDENT'
  | 'OTHER';

/**
 * Temporal bounds validation (BR-08 / I-08).
 * Returns true when start ≤ end, or end is not provided.
 */
export function isValidTemporalBounds(
  startDate: string,
  endDate?: string | null,
): boolean {
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return false;
  if (!endDate) return true;
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return false;
  return start <= end;
}

// ---- PEOPLE-5 applicant lifecycle -----------------------------------------

export type ApplicantStatusValue =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export const APPLICANT_TERMINAL_STATUSES = ['ACCEPTED', 'REJECTED', 'EXPIRED'] as const;

export function isApplicantTerminal(status: ApplicantStatusValue): boolean {
  return (APPLICANT_TERMINAL_STATUSES as readonly string[]).includes(status);
}

/**
 * Generic status updates via the applicant update endpoint only move between
 * the open states (APPLIED ↔ UNDER_REVIEW, spec §5.6/§9.8). Terminal states
 * (ACCEPTED / REJECTED / EXPIRED) are closed: entering them is exclusive to
 * the accept / reject / expiry paths.
 */
export function canPatchApplicantStatus(
  from: ApplicantStatusValue,
  to: ApplicantStatusValue,
): boolean {
  if (isApplicantTerminal(to)) {
    return from === to;
  }
  if (from === to) {
    return true;
  }
  return (
    (from === 'APPLIED' && to === 'UNDER_REVIEW') ||
    (from === 'UNDER_REVIEW' && to === 'APPLIED')
  );
}

/** Accept/Reject are only available on an open (non-terminal) application. */
export function canMakeApplicantDecision(status: ApplicantStatusValue): boolean {
  return status === 'APPLIED' || status === 'UNDER_REVIEW';
}