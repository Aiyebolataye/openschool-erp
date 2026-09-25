/**
 * D-4 dedup storage contract. A store must be able to claim a key exactly
 * once within `ttlSeconds` — the classic "first writer wins" primitive that
 * backs the 72-hour event idempotency guarantee.
 */
export interface EventDedupStore {
  /**
   * Atomically claim `key` for `ttlSeconds`.
   * @returns `true` when THIS caller acquired the key (first delivery);
   *          `false` when the key was already claimed (duplicate).
   */
  tryAcquire(key: string, ttlSeconds: number): Promise<boolean>;
}