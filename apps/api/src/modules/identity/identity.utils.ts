import { createHash, randomBytes } from 'crypto';

export function normalizeEmail(email: string): string {
  return email.trim().normalize('NFKC').toLowerCase();
}

/**
 * Canonical login identifier (D-09). Applies the same normalization as
 * `normalizeEmail` (trim, NFKC, lowercase) to the raw login identifier
 * (external/internal email or Student/Staff ID). Used consistently by
 * registration/login uniqueness checks, pre-auth rate limiting and
 * failed-attempt tracking so the same identifier always maps to one key.
 */
export function normalizeIdentity(identifier: string): string {
  return identifier.trim().normalize('NFKC').toLowerCase();
}

export function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export const PRIVILEGED_ROLES = [
  'PLATFORM_ADMIN',
  'ORG_ADMIN',
  'PRIMARY_INSTITUTION_ADMIN',
  'TENANT_ADMIN',
  'INSTITUTION_ADMIN',
  'PRINCIPAL',
] as const;

export function isPrivilegedRole(roleName: string): boolean {
  const normalized = roleName.toUpperCase().trim();
  return (PRIVILEGED_ROLES as readonly string[]).includes(normalized);
}

interface UserRoleWithPermissions {
  role: {
    permissions: {
      permission: { resource: string; action: string };
    }[];
  };
}

export function permissionsFromRoles(
  userRoles: UserRoleWithPermissions[],
): string[] {
  return [
    ...new Set(
      userRoles.flatMap((r) =>
        r.role.permissions.map((p) => `${p.permission.resource}:${p.permission.action}`),
      ),
    ),
  ];
}

const INTERNAL_EMAIL_LOCAL_PART_MAX_LENGTH = 18;
const INTERNAL_EMAIL_SUFFIX_MAX_LENGTH = 6;

function slugifyPart(value: string): string {
  return value
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24);
}

/**
 * Generate a deterministic, institution-scoped internal (school) email address.
 *
 * Internal school addresses are separate from the person's external mailbox
 * (spec §14/§17/§35): they cannot receive external mail, are not user-editable,
 * remain unchanged when the external email changes, and are unique within the
 * institution. The optional `suffix` resolves collisions deterministically
 * (e.g. "2", "3").
 */
export function generateInternalEmail(
  firstName: string,
  lastName: string,
  institutionCode: string,
  suffix?: string,
): string {
  const first = slugifyPart(firstName).slice(0, 10);
  const last = slugifyPart(lastName).slice(0, 10);
  const local = `${first}.${last}`.slice(0, INTERNAL_EMAIL_LOCAL_PART_MAX_LENGTH);
  const dedupe = suffix ? `.${slugifyPart(suffix).slice(0, INTERNAL_EMAIL_SUFFIX_MAX_LENGTH)}` : '';
  const domain = slugifyPart(institutionCode).slice(0, 24) || 'school';
  return `${local}${dedupe}@${domain}.local`;
}