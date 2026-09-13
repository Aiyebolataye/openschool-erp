import { AuditService } from './audit.service';

const configStub = (behavior: (path: string, def: unknown) => unknown) =>
  ({ get: jest.fn((path: string, def?: unknown) => behavior(path, def)) }) as never;

describe('AuditService', () => {
  const auditLog = {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
  };
  const prisma = { auditLog } as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseInput = {
    tenantId: 'tenant-1',
    actorId: 'user-1',
    actorEmail: 'okonkwo@example.com',
    action: 'auth.login.succeeded',
    entityType: 'user',
    entityId: 'user-1',
    changes: { method: 'password' },
    contextIp: '127.0.0.1',
    contextUserAgent: 'supertest',
    correlationId: 'corr-1',
  };

  it('persists only whitelisted fields (no raw event spread)', async () => {
    const service = new AuditService(prisma, configStub(() => true));
    const smuggled = { ...baseInput, injectedField: 'should-never-reach-db' };

    await service.record(smuggled as Parameters<AuditService['record']>[0]);

    const data = auditLog.create.mock.calls[0][0].data;
    expect(data.action).toBe('auth.login.succeeded');
    expect(data.entityType).toBe('user');
    expect(data.actorId).toBe('user-1');
    expect(data.actorEmail).toBe('okonkwo@example.com');
    expect(data.tenant).toEqual({ connect: { id: 'tenant-1' } });
    expect(data.changes).toEqual({ method: 'password' });
    expect(data.contextIp).toBe('127.0.0.1');
    expect(data.correlationId).toBe('corr-1');
    expect(data.injectedField).toBeUndefined();
  });

  it('omits actorEmail when capture is disabled', async () => {
    const service = new AuditService(prisma, configStub(() => false));
    await service.record(baseInput);
    const data = auditLog.create.mock.calls[0][0].data;
    expect(data.actorEmail).toBeUndefined();
  });

  it('skips the tenant relation for tenant-less rows', async () => {
    const service = new AuditService(prisma, configStub(() => true));
    await service.record({ ...baseInput, tenantId: null });
    const data = auditLog.create.mock.calls[0][0].data;
    expect(data.tenant).toBeUndefined();
  });

  it('stringifies old/new values into their text columns', async () => {
    const service = new AuditService(prisma, configStub(() => true));
    await service.record({
      ...baseInput,
      entityId: null,
      oldValues: { status: 'PENDING' },
      newValues: { status: 'ACCEPTED' },
    });
    const data = auditLog.create.mock.calls[0][0].data;
    expect(data.oldValues).toBe(JSON.stringify({ status: 'PENDING' }));
    expect(data.newValues).toBe(JSON.stringify({ status: 'ACCEPTED' }));
  });

  it('lists with the locked flat envelope and tenant scope', async () => {
    const service = new AuditService(prisma, configStub(() => true));
    auditLog.count.mockResolvedValue(3);
    auditLog.findMany.mockResolvedValue([{ id: 'a', action: 'auth.login.succeeded' }]);

    const result = await service.list('tenant-1', { page: 1, limit: 20 });

    expect(result).toEqual({
      success: true,
      data: {
        items: [{ id: 'a', action: 'auth.login.succeeded' }],
        total: 3,
        page: 1,
        limit: 20,
      },
    });
    expect(auditLog.count).toHaveBeenCalledWith({ where: { tenantId: 'tenant-1' } });
    expect(auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1' },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
    );
  });

  it('applies the optional action filter to listings', async () => {
    const service = new AuditService(prisma, configStub(() => true));
    auditLog.count.mockResolvedValue(0);
    auditLog.findMany.mockResolvedValue([]);

    await service.list('tenant-1', { page: 2, limit: 10, action: 'auth.login.failed' });

    expect(auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', action: 'auth.login.failed' },
        skip: 10,
        take: 10,
      }),
    );
  });

  it('exposes no update or delete path', () => {
    const service = new AuditService(prisma, configStub(() => true)) as unknown as Record<
      string,
      unknown
    >;
    expect(typeof service.update).toBe('undefined');
    expect(typeof service.delete).toBe('undefined');
  });
});