import {
  assertValidPublicId,
  generatePublicId,
  isValidPublicId,
  nextPublicIdSequence,
  parsePublicId,
} from './people.utils';

describe('people.utils — public-ID foundation', () => {
  it('generates the frozen spec format <PREFIX>-<YYYY>-<NNNNNN>', () => {
    expect(generatePublicId('P', 1)).toBe(`P-${new Date().getFullYear()}-000001`);
    expect(generatePublicId('P', 1, 2026)).toBe('P-2026-000001');
    expect(generatePublicId('STU', 42, 2026)).toBe('STU-2026-000042');
    expect(generatePublicId('EMP', 1000000 - 1, 2026)).toBe('EMP-2026-999999');
    expect(generatePublicId('APP', 0, 2026)).toBe('APP-2026-000000');
  });

  it('rejects out-of-range sequences', () => {
    expect(() => generatePublicId('STU', -1, 2026)).toThrow();
    expect(() => generatePublicId('STU', 1000000, 2026)).toThrow();
    expect(() => generatePublicId('STU', 1.5, 2026)).toThrow();
  });

  it('parses and validates ids', () => {
    const parsed = parsePublicId('STU-2026-000042');
    expect(parsed).toEqual({ prefix: 'STU', year: 2026, sequence: 42 });
    expect(isValidPublicId('P-2026-000001')).toBe(true);
    expect(isValidPublicId('stU-2026-000001')).toBe(false);
    expect(isValidPublicId('P-26-000001')).toBe(false);
    expect(isValidPublicId('P-2026-0000010')).toBe(false);
    expect(isValidPublicId('')).toBe(false);
    expect(parsePublicId('garbage')).toBeNull();
  });

  it('asserts on invalid ids', () => {
    expect(assertValidPublicId('EMP-2025-000007').sequence).toBe(7);
    expect(() => assertValidPublicId('FACULTY-2026-000001')).toThrow();
  });

  it('derives the next tenant-scoped sequence deterministically', () => {
    const existing = ['P-2026-000000', 'P-2026-000001', 'P-2026-000003'];
    expect(nextPublicIdSequence('P', existing)).toBe(2);
    expect(nextPublicIdSequence('P', [])).toBe(0);
    // other prefixes do not consume the sequence space
    const mixed = ['P-2026-000000', 'STU-2026-000000', 'EMP-2026-000000', 'APP-2026-000000'];
    expect(nextPublicIdSequence('STU', mixed)).toBe(1);
  });
});