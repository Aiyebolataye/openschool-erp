import {
  DEFAULT_PASSWORD_POLICY,
  validatePasswordAgainstPolicy,
} from './password-policy.service';

describe('validatePasswordAgainstPolicy', () => {
  const policy = DEFAULT_PASSWORD_POLICY;

  it('accepts a password meeting all default requirements', () => {
    expect(validatePasswordAgainstPolicy('Abcd1234!', policy)).toEqual([]);
  });

  it('rejects a short password', () => {
    const errors = validatePasswordAgainstPolicy('A1!a', policy);
    expect(errors.some((e) => e.includes('at least 8'))).toBe(true);
  });

  it('rejects a password without uppercase', () => {
    const errors = validatePasswordAgainstPolicy('abcd1234!', policy);
    expect(errors.some((e) => e.includes('uppercase'))).toBe(true);
  });

  it('rejects a password without digits', () => {
    const errors = validatePasswordAgainstPolicy('Abcdefgh!', policy);
    expect(errors.some((e) => e.includes('digit'))).toBe(true);
  });

  it('rejects a password without a special character', () => {
    const errors = validatePasswordAgainstPolicy('Abcd1234', policy);
    expect(errors.some((e) => e.includes('special'))).toBe(true);
  });

  it('respects a custom minLength', () => {
    const custom = { ...policy, minLength: 12 };
    expect(validatePasswordAgainstPolicy('Abcd1234!', custom).length).toBeGreaterThan(0);
    expect(validatePasswordAgainstPolicy('Abcdefgh1234!', custom)).toEqual([]);
  });

  it('respects relaxed requirements', () => {
    const relaxed = { ...policy, requireSpecialChar: false };
    expect(validatePasswordAgainstPolicy('Abcd1234', relaxed)).toEqual([]);
  });
});