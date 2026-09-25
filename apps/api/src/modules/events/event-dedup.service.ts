import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EVENT_DEDUP_TTL_SECONDS,
} from './event-envelope';
import { EventDedupStore } from './event-dedup.store';
import { EVENT_DEDUP_STORE } from './events.module.tokens';

/**
 * D-4 72-hour event idempotency/dedup guard.
 *
 * Keys are namespaced `event-dedup:{namespace}:{tenantId}:{eventId}` so
 * different domains never collide and the same `eventId` under two tenants
 * stays isolated. Only ever returns `true` (duplicate) for an `eventId` that
 * was already claimed — TTL defaults to 72h and is config driven.
 */
@Injectable()
export class EventDedupService {
  constructor(
    @Inject(EVENT_DEDUP_STORE) private readonly store: EventDedupStore,
    private readonly config: ConfigService,
  ) {}

  private ttlSeconds(): number {
    return this.config.get<number>('events.dedupTtlSeconds', EVENT_DEDUP_TTL_SECONDS);
  }

  /**
   * @returns `true` when this eventId was ALREADY processed (a duplicate that
   *          must be skipped), `false` when it is the first delivery.
   */
  async isDuplicate(namespace: string, tenantId: string, eventId: string): Promise<boolean> {
    const key = `event-dedup:${namespace}:${tenantId}:${eventId}`;
    return !(await this.store.tryAcquire(key, this.ttlSeconds()));
  }
}