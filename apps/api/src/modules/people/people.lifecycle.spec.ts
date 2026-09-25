import {
  canGraduate,
  canPatchGuardianStatus,
  canPatchParentStatus,
  canPatchStatus,
  canPatchStaffStatus,
  canTransfer,
  canWithdraw,
  isMutableEmployment,
  isMutableEnrollment,
  isValidTemporalBounds,
  StaffStatusValue,
  StudentStatusValue,
} from './people.lifecycle';

const STATUSES: StudentStatusValue[] = [
  'ENROLLED',
  'ACTIVE',
  'TRANSFERRED',
  'WITHDRAWN',
  'GRADUATED',
];

describe('people.lifecycle', () => {
  describe('canGraduate', () => {
    it('is ONLY true for currently enrolled/active students', () => {
      expect(canGraduate('ENROLLED')).toBe(true);
      expect(canGraduate('ACTIVE')).toBe(true);
      expect(canGraduate('TRANSFERRED')).toBe(false);
      expect(canGraduate('WITHDRAWN')).toBe(false);
      expect(canGraduate('GRADUATED')).toBe(false);
    });
  });

  describe('canTransfer', () => {
    it('is ONLY true for currently enrolled/active students', () => {
      expect(canTransfer('ENROLLED')).toBe(true);
      expect(canTransfer('ACTIVE')).toBe(true);
      expect(canTransfer('TRANSFERRED')).toBe(false);
      expect(canTransfer('WITHDRAWN')).toBe(false);
      expect(canTransfer('GRADUATED')).toBe(false);
    });
  });

  describe('canWithdraw', () => {
    it('is ONLY true for currently enrolled/active students', () => {
      expect(canWithdraw('ENROLLED')).toBe(true);
      expect(canWithdraw('ACTIVE')).toBe(true);
      expect(canWithdraw('TRANSFERRED')).toBe(false);
      expect(canWithdraw('WITHDRAWN')).toBe(false);
      expect(canWithdraw('GRADUATED')).toBe(false);
    });
  });

  describe('isMutableEnrollment', () => {
    it('is true exactly for ENROLLED/ACTIVE (D-E terminal-state immutability)', () => {
      for (const status of STATUSES) {
        expect(isMutableEnrollment(status)).toBe(
          status === 'ENROLLED' || status === 'ACTIVE',
        );
      }
    });
  });

  describe('canPatchStatus', () => {
    it('allows only same-state stay or the forward ENROLLED → ACTIVE move', () => {
      for (const status of STATUSES) {
        expect(canPatchStatus(status, status)).toBe(true);
      }
      expect(canPatchStatus('ENROLLED', 'ACTIVE')).toBe(true);
      expect(canPatchStatus('ACTIVE', 'ENROLLED')).toBe(false);
      expect(canPatchStatus('GRADUATED', 'ACTIVE')).toBe(false);
      expect(canPatchStatus('GRADUATED', 'WITHDRAWN')).toBe(false);
      expect(canPatchStatus('TRANSFERRED', 'ACTIVE')).toBe(false);
      expect(canPatchStatus('WITHDRAWN', 'ACTIVE')).toBe(false);
    });
  });

  describe('canPatchStaffStatus (PEOPLE-3)', () => {
    const STAFF_STATUSES: StaffStatusValue[] = ['HIRED', 'ACTIVE', 'ON_LEAVE', 'SEPARATED'];

    it('allows same-state stay for every staff status', () => {
      for (const status of STAFF_STATUSES) {
        expect(canPatchStaffStatus(status, status)).toBe(true);
      }
    });

    it('allows the forward HIRED → ACTIVE move and reverse is denied', () => {
      expect(canPatchStaffStatus('HIRED', 'ACTIVE')).toBe(true);
      expect(canPatchStaffStatus('ACTIVE', 'HIRED')).toBe(false);
    });

    it('allows ACTIVE → ON_LEAVE and ON_LEAVE → ACTIVE; HIRED never goes on leave', () => {
      expect(canPatchStaffStatus('ACTIVE', 'ON_LEAVE')).toBe(true);
      expect(canPatchStaffStatus('ON_LEAVE', 'ACTIVE')).toBe(true);
      expect(canPatchStaffStatus('HIRED', 'ON_LEAVE')).toBe(false);
      expect(canPatchStaffStatus('ON_LEAVE', 'HIRED')).toBe(false);
    });

    it('allows separation from HIRED, ACTIVE and ON_LEAVE', () => {
      expect(canPatchStaffStatus('HIRED', 'SEPARATED')).toBe(true);
      expect(canPatchStaffStatus('ACTIVE', 'SEPARATED')).toBe(true);
      expect(canPatchStaffStatus('ON_LEAVE', 'SEPARATED')).toBe(true);
    });

    it('SEPARATED is terminal — no transition may leave it', () => {
      expect(canPatchStaffStatus('SEPARATED', 'HIRED')).toBe(false);
      expect(canPatchStaffStatus('SEPARATED', 'ACTIVE')).toBe(false);
      expect(canPatchStaffStatus('SEPARATED', 'ON_LEAVE')).toBe(false);
      expect(canPatchStaffStatus('SEPARATED', 'SEPARATED')).toBe(true);
    });

    it('never allows arbitrary jumps (HIRED → HIRED already covered; ACTIVE skip)', () => {
      expect(canPatchStaffStatus('ON_LEAVE', 'HIRED')).toBe(false);
      expect(canPatchStaffStatus('HIRED', 'SEPARATED')).toBe(true);
      expect(canPatchStaffStatus('ACTIVE', 'ON_LEAVE')).toBe(true);
      expect(canPatchStaffStatus('ON_LEAVE', 'SEPARATED')).toBe(true);
    });
  });

  describe('isMutableEmployment (PEOPLE-3)', () => {
    it('is true for HIRED/ACTIVE/ON_LEAVE and false only for the terminal SEPARATED', () => {
      const statuses: StaffStatusValue[] = ['HIRED', 'ACTIVE', 'ON_LEAVE', 'SEPARATED'];
      for (const status of statuses) {
        expect(isMutableEmployment(status)).toBe(status !== 'SEPARATED');
      }
    });
  });

  describe('canPatchParentStatus (PEOPLE-4)', () => {
    it('allows same-state stay plus the ACTIVE → INACTIVE move only', () => {
      expect(canPatchParentStatus('ACTIVE', 'ACTIVE')).toBe(true);
      expect(canPatchParentStatus('INACTIVE', 'INACTIVE')).toBe(true);
      expect(canPatchParentStatus('ACTIVE', 'INACTIVE')).toBe(true);
      expect(canPatchParentStatus('INACTIVE', 'ACTIVE')).toBe(false);
    });
  });

  describe('canPatchGuardianStatus (PEOPLE-4)', () => {
    it('allows same-state stay plus the ACTIVE → INACTIVE move only', () => {
      expect(canPatchGuardianStatus('ACTIVE', 'ACTIVE')).toBe(true);
      expect(canPatchGuardianStatus('INACTIVE', 'INACTIVE')).toBe(true);
      expect(canPatchGuardianStatus('ACTIVE', 'INACTIVE')).toBe(true);
      expect(canPatchGuardianStatus('INACTIVE', 'ACTIVE')).toBe(false);
    });
  });

  describe('isValidTemporalBounds (PEOPLE-4, BR-08 / I-08)', () => {
    it('accepts no-endDate and start before-or-equal end', () => {
      expect(isValidTemporalBounds('2026-09-01')).toBe(true);
      expect(isValidTemporalBounds('2026-09-01', null)).toBe(true);
      expect(isValidTemporalBounds('2026-09-01', '2026-09-30')).toBe(true);
      expect(isValidTemporalBounds('2026-09-30', '2026-09-30')).toBe(true);
    });

    it('rejects end before start and garbage dates', () => {
      expect(isValidTemporalBounds('2026-09-30', '2026-09-01')).toBe(false);
      expect(isValidTemporalBounds('not-a-date', '2026-09-30')).toBe(false);
      expect(isValidTemporalBounds('2026-09-01', 'not-a-date')).toBe(false);
      expect(isValidTemporalBounds('2026-09-01', '2025-01-01')).toBe(false);
    });
  });
});