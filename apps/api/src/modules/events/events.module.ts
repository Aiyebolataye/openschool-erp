import { Global, Module } from '@nestjs/common';
import { EventDedupService } from './event-dedup.service';
import { EventDedupStore } from './event-dedup.store';
import { EventPublisher } from './event-publisher';
import { EVENT_DEDUP_STORE } from './events.module.tokens';
import { RedisEventDedupStore } from './redis-event-dedup.store';

/**
 * D-4 events infrastructure (Phase 5, locked decision D-4): envelope-aware
 * publishing + 72h idempotency/dedup, additive over the existing EventEmitter2
 * bus. The Redis-backed store is the app-wide default; tests override the
 * `EVENT_DEDUP_STORE` token with the hermetic in-memory store.
 */
@Global()
@Module({
  providers: [
    { provide: EVENT_DEDUP_STORE, useClass: RedisEventDedupStore },
    EventDedupService,
    EventPublisher,
  ],
  exports: [EventDedupService, EventPublisher],
})
export class EventsModule {}

export { EventDedupService, EventPublisher, EVENT_DEDUP_STORE };
export type { EventDedupStore };