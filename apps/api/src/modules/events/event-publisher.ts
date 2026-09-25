import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { buildEventEnvelope, EventEnvelopeFields } from './event-envelope';

/**
 * D-4 envelope-aware publisher (Phase 5). Emits through the same EventEmitter2
 * bus, stamping every payload ADDITIVELY with the envelope fields
 * (eventId / causationId / schemaVersion / emittedAt / tenantId). A producer
 * redelivering the SAME logical occurrence MUST pass the same `eventId` so the
 * 72-hour dedup collapses the duplicate downstream.
 */
@Injectable()
export class EventPublisher {
  constructor(private readonly emitter: EventEmitter2) {}

  publish<T extends Record<string, unknown> & EventEnvelopeFields>(
    event: string,
    tenantId: string,
    payload: Omit<T, keyof EventEnvelopeFields>,
    options: { eventId?: string; causationId?: string | null } = {},
  ): void {
    const envelope = buildEventEnvelope(tenantId, options);
    this.emitter.emit(event, { ...payload, ...envelope });
  }
}