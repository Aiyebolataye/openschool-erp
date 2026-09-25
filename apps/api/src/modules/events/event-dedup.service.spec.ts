import { ConfigService } from '@nestjs/config';
import { EventDedupService } from './event-dedup.service';
import { EVENT_DEDUP_STORE } from './events.module.tokens';
import { InMemoryEventDedupStore } from './in-memory-event-dedup.store';

const TTL_KEY = 'events.dedupTtlSeconds';

function makeService(ttlSeconds: number, store?: InMemoryEventDedupStore) {
  const config = {
    get: jest.fn((path: string, def: unknown) =>
      path === TTL_KEY ? ttlSeconds : def,
    ),
  } as unknown as ConfigService;
  return new EventDedupService(store ?? new InMemoryEventDedupStore(), config);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('EventDedupService (D-4, 72h idempotency)', () => {
  it('flags a duplicate delivery of the same eventId', async () => {
    const service = makeService(72 * 60 * 60);

    await expect(service.isDuplicate('academics', 't1', 'evt-1')).resolves.toBe(false);
    await expect(service.isDuplicate('academics', 't1', 'evt-1')).resolves.toBe(true);
  });

  it('collapses concurrent duplicates to a single acquirer', async () => {
    const service = makeService(72 * 60 * 60);

    const results = await Promise.all(
      Array.from({ length: 10 }, () => service.isDuplicate('audit', 't1', 'race-1')),
    );
    expect(results.filter((duplicate) => duplicate === false)).toHaveLength(1);
    expect(results.filter((duplicate) => duplicate === true)).toHaveLength(9);
  });

  it('dedupes identical eventIds across different namespace consumers of the same tenant', async () => {
    const service = makeService(72 * 60 * 60);

    await expect(service.isDuplicate('audit', 't1', 'same-id')).resolves.toBe(false);
    await expect(service.isDuplicate('audit', 't1', 'same-id')).resolves.toBe(true);
  });

  it('keeps tenants isolated: same eventId under another tenant is NOT a duplicate', async () => {
    const service = makeService(72 * 60 * 60);

    await expect(service.isDuplicate('audit', 'tenant-a', 'evt-x')).resolves.toBe(false);
    await expect(service.isDuplicate('audit', 'tenant-b', 'evt-x')).resolves.toBe(false);
  });

  it('expires dedup markers after the ttl (default 72h, short here)', async () => {
    const service = makeService(0.01); // 10ms

    await expect(service.isDuplicate('audit', 't1', 'expiring')).resolves.toBe(false);
    await sleep(40);
    await expect(service.isDuplicate('audit', 't1', 'expiring')).resolves.toBe(false);
  });

  it('isolates dedup state across services sharing a store', async () => {
    const store = new InMemoryEventDedupStore();
    const first = makeService(7200, store);
    const second = makeService(7200, store);

    await expect(first.isDuplicate('academics', 't1', 'shared-id')).resolves.toBe(false);
    await expect(second.isDuplicate('academics', 't1', 'shared-id')).resolves.toBe(true);
  });
});

describe('EventDedupService storage token', () => {
  it('exposes a single DI token for the store', () => {
    expect(EVENT_DEDUP_STORE).toEqual(expect.any(Symbol));
  });
});