import { Prisma } from '@prisma/client';
import { EventPublisher } from '../events/event-publisher';
import { EventEnvelopeFields, generateEventId } from '../events/event-envelope';
import { AuditService } from '../audit/audit.service';
/**
 * P6.1 / P6.2 — Finance domain events (D-4 envelope-aware, frozen Finance §5.8).
 *
 * Every mutation stamps one eventId shared by the emitted event AND the audit
 * row, so the 72-hour dedup collapses duplicate deliveries of the same logical
 * occurrence. Payloads are emitted ADDITIVELY on top of the envelope fields;
 * producers never include eventId/causationId/schemaVersion/emittedAt/
 * tenantId themselves.
 *
 * Only events whose trigger is implemented in this codebase are declared. A
 * §5.8 event is not declared until the operation that fires it exists, so the
 * catalogue can never claim a notification/audit path that does not run.
 */
export const FinanceEvents = {
  // Fee structure (P6.1)
  FeeCategoryCreated: 'finance.fee-category.created',
  FeeCategoryUpdated: 'finance.fee-category.updated',
  FeeItemCreated: 'finance.fee-item.created',
  FeeItemUpdated: 'finance.fee-item.updated',
  // Fee schedules (P6.2) — §5.8
  FeeScheduleCreated: 'finance.fee-schedule.created',
  FeeSchedulePublished: 'finance.fee-schedule.published',
  // Billing (P6.2) — §5.8
  BillGenerated: 'finance.bill.generated',
  BillCancelled: 'finance.bill.cancelled',
  // Discounts (P6.2) — §5.8. DiscountApplied / DiscountRemoved are NOT emitted
  // here: applying a discount targets an invoice, and the canonical invoice
  // table is gated behind the Finance legacy-archival decision.
  DiscountCreated: 'finance.discount.created',
  // Accounting (P6.2) — §5.8
  JournalEntryPosted: 'finance.journal-entry.posted',
  // Financial policies (P6.2) — §5.8
  FinancialPolicyCreated: 'finance.financial-policy.created',
  FinancialPolicyUpdated: 'finance.financial-policy.updated',
} as const;

export type FinanceEventName = (typeof FinanceEvents)[keyof typeof FinanceEvents];

export type FinanceEventPayload = {
  tenantId: string;
  entityType: string;
  entityId: string;
  actorId?: string | null;
  institutionId?: string;
  causationId?: string | null;
} & EventEnvelopeFields &
  Record<string, unknown>;

export interface EmitFinanceEventOptions {
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
 * Emits an envelope-aware finance event AND persists a linked audit row,
 * sharing one eventId so the D-4 dedicated audit dedup collapses redeliveries
 * to a single row. Returns the generated eventId.
 *
 * Per frozen Finance §129, the audit `changes` of a financial record also carry
 * the amount, so callers pass it through `changes`.
 */
export async function emitFinanceEventAudited(
  publisher: EventPublisher,
  audit: AuditService,
  event: FinanceEventName,
  options: EmitFinanceEventOptions,
): Promise<string> {
  const eventId = generateEventId();
  publisher.publish<FinanceEventPayload>(event, options.tenantId, {
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

/**
 * Audit-only variant, for the mutations §5.8 gives no domain event.
 *
 * §5.8 declares events for fee categories, fee items, fee templates, fee
 * schedules, bills, invoices, payments, discounts, scholarships, refunds,
 * adjustments, write-offs, installments, journal entries, period closure and
 * financial policies. It declares none for creating a ledger account or opening
 * a financial period. Emitting a neighbouring event (say JournalEntryPosted) for
 * those writes would tell every consumer a journal entry was posted when none
 * was, so those two mutations record an audit row only.
 *
 * `action` is namespaced under `finance.` so audit queries stay filterable, and
 * the row still carries a shared eventId so D-4 dedup applies.
 */
export async function recordFinanceAuditOnly(
  audit: AuditService,
  action: string,
  options: Omit<EmitFinanceEventOptions, 'payload' | 'causationId'>,
): Promise<string> {
  const eventId = generateEventId();
  await audit.record({
    tenantId: options.tenantId,
    actorId: options.actorId ?? null,
    action: `finance.${action}`,
    entityType: options.entityType,
    entityId: options.entityId,
    changes: options.changes ?? undefined,
    eventId,
  });
  return eventId;
}
