import { AuditService, AuditRecordInput } from './audit.service';
import { EventDedupService } from '../events/event-dedup.service';
import { InMemoryEventDedupStore } from '../events/in-memory-event-dedup.store';

const configStub = (behavior: (path: string, def: unknown) => unknown) =>
  ({ get: jest.fn((path: string, def?: unknown) => behavior(path, def)) }) as never;

function makeDedup() {
  const store = new InMemoryEventDedupStore();
  const config = {
    get: jest.fn((path: string, def: unknown) =>
      path === 'events.dedupTtlSeconds' ? 72 * 60 * 60 : def,
    ),
  } as never;
  return new EventDedupService(store, config);
}

describe('AuditService D-4 canonical audit interaction', () => {
  const auditLog = { create: jest.fn() };
  const prisma = { auditLog } as never;

  const baseInput: AuditRecordInput = {
    tenantId: 'tenant-1',
    actorId: 'user-1',
    actorEmail: 'okonkwo@example.com',
    action: 'academics.term.closed',
    entityType: 'term',
    entityId: 'term-1',
    changes: { eventId: 'evt-1' },
    correlationId: 'corr-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists ONE row when the same eventId is delivered twice', async () => {
    const dedup = makeDedup();
    const service = new AuditService(prisma, configStub(() => true), dedup);

    await service.record({ ...baseInput, eventId: 'evt-1' });
    await service.record({ ...baseInput, eventId: 'evt-1' });

    expect(auditLog.create).toHaveBeenCalledTimes(1);
  });

  it('persists separately for the same eventId under different tenants', async () => {
    const dedup = makeDedup();
    const service = new AuditService(prisma, configStub(() => true), dedup);

    await service.record({ ...baseInput, tenantId: 'tenant-a', eventId: 'evt-2' });
    await service.record({ ...baseInput, tenantId: 'tenant-b', eventId: 'evt-2' });

    expect(auditLog.create).toHaveBeenCalledTimes(2);
  });

  it('preserves the legacy path: no eventId means always persist', async () => {
    const dedup = makeDedup();
    const service = new AuditService(prisma, configStub(() => true), dedup);

    const { eventId: _ignored, ...legacy } = baseInput;
    await service.record(legacy);
    await service.record(legacy);

    expect(auditLog.create).toHaveBeenCalledTimes(2);
  });

  it('is inert when no dedup service is wired (backward compatible construction)', async () => {
    const service = new AuditService(prisma, configStub(() => true));

    await service.record({ ...baseInput, eventId: 'evt-3' });
    await service.record({ ...baseInput, eventId: 'evt-3' });

    expect(auditLog.create).toHaveBeenCalledTimes(2);
  });
});