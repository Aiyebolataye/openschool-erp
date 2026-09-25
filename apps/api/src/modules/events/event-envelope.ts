import { randomUUID } from 'crypto';

/**
 * D-4 event envelope (Phase 5, locked decision D-4).
 *
 * The in-process bus stays EventEmitter2; the envelope is extended
 * ADDITIVELY with `eventId`, `causationId` and `schemaVersion`. Existing
 * payload fields are preserved untouched — domain payloads that don't opt in
 * keep their exact shape and behaviour. The envelope powers the 72-hour
 * idempotency/dedup guarantee (`EventDedupService`).
 */

/** Current event schema version. Increment only on a breaking envelope change. */
export const EVENT_SCHEMA_VERSION = 1;

/** Default dedup retention: 72 hours. */
export const EVENT_DEDUP_TTL_SECONDS = 72 * 60 * 60;

export interface BaseEventEnvelope {
  /**
   * Stable, globally-unique id for one logical event occurrence. MUST be
   * re-used when the same logical occurrence is redelivered so dedup collapses
   * duplicates instead of double-applying.
   */
  eventId: string;
  /** Id of the event that caused this one (null for root events). */
  causationId: string | null;
  schemaVersion: number;
  emittedAt: string;
  tenantId: string;
}

/**
 * Optional, additive envelope fields any domain payload may carry. Producers
 * that adopt the envelope set these; existing producers are unaffected.
 */
export interface EventEnvelopeFields {
  eventId?: string;
  causationId?: string | null;
  schemaVersion?: number;
}

export function generateEventId(): string {
  return randomUUID();
}

export function buildEventEnvelope(
  tenantId: string,
  options: { eventId?: string; causationId?: string | null } = {},
): BaseEventEnvelope {
  return {
    eventId: options.eventId ?? generateEventId(),
    causationId: options.causationId ?? null,
    schemaVersion: EVENT_SCHEMA_VERSION,
    emittedAt: new Date().toISOString(),
    tenantId,
  };
}