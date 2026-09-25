import { EventDedupStore } from './event-dedup.store';

/**
 * Process-local dedup store (D-4). Single-threaded V8 gives atomic
 * check-and-set, so concurrent deliveries of the same `eventId` collapse to a
 * single acquirer. Used as the hermetic default for unit tests and as a
 * graceful fallback when Redis cannot serve (fail-open semantics are handled
 * by the caller/Redis store).
 */
export class InMemoryEventDedupStore implements EventDedupStore {
  private readonly seen = new Map<string, number>();

  async tryAcquire(key: string, ttlSeconds: number): Promise<boolean> {
    const now = Date.now();
    const expiresAt = this.seen.get(key);
    if (expiresAt !== undefined && expiresAt > now) {
      return false;
    }
    this.seen.set(key, now + ttlSeconds * 1000);
    return true;
  }
}