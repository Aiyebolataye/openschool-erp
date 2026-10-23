import { ForbiddenException } from '@nestjs/common';

/**
 * D-2 (locked, Option 1) — Finance is the sole authoritative owner of financial
 * configuration and financial policy. Institution Management must not create an
 * independent financial source of truth, so the `financial.*` namespace is
 * reserved and rejected at the write path of both institution-scoped
 * configuration tables (`institution_configurations` and `institution_settings`).
 *
 * Scope limits, recorded deliberately so this reservation is not over-read:
 *
 * - This is an *ownership* boundary, not a value schema. It deliberately does
 *   not validate configuration values. Per-category JSON schemas remain a
 *   documented prerequisite (frozen Institution spec 11.2: "schema validation
 *   applied per category") and are not defined by any specification yet, so
 *   strict per-category validation is NOT implemented here.
 * - This does not imply a gateway credential store exists. The frozen Finance
 *   spec 12.4 requires gateway keys to be encrypted at rest and never exposed,
 *   but no such mechanism is implemented in this repository. Because
 *   `financial.*` cannot be written here at all, no gateway secret can reach
 *   this JSON; the secure credential mechanism remains a Finance prerequisite.
 * - This does not decide `Institution.currency`, which is a separate decision
 *   (D-3) and is deliberately left untouched.
 *
 * The namespace list is intentionally minimal and mirrors the single category
 * removed from the frozen Institution spec 11.1 by ADR-031. It is not a general
 * category registry: the remaining Institution categories are unenforced because
 * no schema exists for them.
 */

const RESERVED_CONFIG_NAMESPACES: readonly string[] = ['financial'];

export function reservedNamespaceOf(key: string): string | null {
  const [firstSegment] = key.trim().toLowerCase().split('.');
  return firstSegment && RESERVED_CONFIG_NAMESPACES.includes(firstSegment) ? firstSegment : null;
}

export function isReservedConfigKey(key: string): boolean {
  return reservedNamespaceOf(key) !== null;
}

export function assertNotReservedConfigKey(key: string, surface: string): void {
  const reserved = reservedNamespaceOf(key);
  if (reserved) {
    throw new ForbiddenException(
      `configuration key "${key}" is in the reserved "${reserved}." namespace owned by the Finance domain; it cannot be written through institution ${surface}`,
    );
  }
}
