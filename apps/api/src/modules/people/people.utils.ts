/**
 * Public-ID generation foundation (PEOPLE-1).
 *
 * Spec format (engineering/People Engineering.md §7.2): `<PREFIX>-<YYYY>-<NNNNNN>`
 * with immutable, tenant-scoped uniqueness:
 *   P-*   → people          P-2026-000001
 *   STU-* → students        STU-2026-000001
 *   EMP-* → staff           EMP-2026-000001
 *   APP-* → applicants      APP-2026-000001
 *
 * Generation is deterministic (server-side), and uniqueness is enforced by the
 * tenant-scoped unique constraints on `publicId` in the merged schema. The
 * People V2 services will derive the sequence inside a transaction; this module
 * is the frozen format + validation foundation.
 */

export const PEOPLE_PUBLIC_ID_PREFIXES = ['P', 'STU', 'EMP', 'APP'] as const;
export type PeoplePublicIdPrefix = (typeof PEOPLE_PUBLIC_ID_PREFIXES)[number];

export const PEOPLE_PUBLIC_ID_MAX_LENGTH = 11; // P + '-' + 4 + '-' + 6

export const PUBLIC_ID_REGEX = /^(P|STU|EMP|APP)-(\d{4})-(\d{6})$/;

export interface ParsedPublicId {
  prefix: PeoplePublicIdPrefix;
  year: number;
  sequence: number;
}

export function generatePublicId(
  prefix: PeoplePublicIdPrefix,
  sequence: number,
  year: number = new Date().getFullYear(),
): string {
  if (!isValidSequence(sequence)) {
    throw new Error(`publicId sequence must be an integer in [0, 999999], got ${sequence}`);
  }
  return `${prefix}-${year}-${String(sequence).padStart(6, '0')}`;
}

export function parsePublicId(publicId: string): ParsedPublicId | null {
  const match = PUBLIC_ID_REGEX.exec(publicId);
  if (!match) {
    return null;
  }
  return {
    prefix: match[1] as PeoplePublicIdPrefix,
    year: parseInt(match[2], 10),
    sequence: parseInt(match[3], 10),
  };
}

export function isValidPublicId(publicId: string): boolean {
  return parsePublicId(publicId) !== null;
}

export function assertValidPublicId(publicId: string): ParsedPublicId {
  const parsed = parsePublicId(publicId);
  if (!parsed) {
    throw new Error(
      `invalid publicId "${publicId}": expected ${PEOPLE_PUBLIC_ID_PREFIXES.join('|')}-YYYY-NNNNNN`,
    );
  }
  return parsed;
}

/**
 * Deterministic next-sequence for a tenant-scoped publicId set. `existing`
 * should be the already-taken ids for the SAME tenant + prefix scope; the
 * smallest non-negative sequence not already present is returned. Collisions
 * are impossible as long as the caller re-derives inside a transaction and the
 * DB unique constraint guards the insert.
 */
export function nextPublicIdSequence(
  prefix: PeoplePublicIdPrefix,
  existing: Iterable<string>,
): number {
  const taken = new Set<number>();
  for (const id of existing) {
    const parsed = parsePublicId(id);
    if (parsed && parsed.prefix === prefix) {
      taken.add(parsed.sequence);
    }
  }
  let seq = 0;
  while (taken.has(seq)) {
    seq += 1;
  }
  return seq;
}

function isValidSequence(sequence: number): boolean {
  return Number.isInteger(sequence) && sequence >= 0 && sequence <= 999999;
}