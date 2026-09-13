import { SessionService } from './session.service';
import { hashToken, generateToken } from '../identity/identity.utils';
import { SessionEvents } from './session.events';

interface Row {
  id: string;
  tenantId: string;
  userId: string;
  accessTokenHash: string;
  refreshTokenHash: string;
  isActive: boolean;
  lastActivityAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface HistoryRow {
  sessionId: string;
  refreshTokenHash: string;
  createdAt: Date;
}

function matchesWhere(row: Record<string, unknown>, where: Record<string, unknown>): boolean {
  for (const [key, cond] of Object.entries(where)) {
    const value = row[key];
    if (cond && typeof cond === 'object' && 'in' in cond) {
      if (!(cond as { in: unknown[] }).in.includes(value)) return false;
    } else if (cond && typeof cond === 'object' && 'notIn' in cond) {
      if ((cond as { notIn: unknown[] }).notIn.includes(value)) return false;
    } else if (cond && typeof cond === 'object' && 'lte' in cond) {
      const v = value as Date;
      if (v.getTime() > (cond as { lte: Date }).lte.getTime()) return false;
    } else if (cond && typeof cond === 'object' && 'gt' in cond) {
      const v = value as Date;
      if (v.getTime() <= (cond as { gt: Date }).gt.getTime()) return false;
    } else if (value !== cond) {
      return false;
    }
  }
  return true;
}

function makeStore() {
  const sessions: Row[] = [];
  const history: HistoryRow[] = [];
  const users: Record<string, { id: string; status: string; roles: { role: { name: string } }[] }> = {};

  const sessionModel = {
    findUnique: async ({ where }: { where: Record<string, unknown> }) => {
      if (where.refreshTokenHash) {
        return sessions.find((s) => s.refreshTokenHash === where.refreshTokenHash) ?? null;
      }
      if (where.id) {
        return sessions.find((s) => s.id === where.id) ?? null;
      }
      if (where.tenantId_userId_accessTokenHash) {
        const { tenantId, userId, accessTokenHash } = where.tenantId_userId_accessTokenHash as Record<string, string>;
        return (
          sessions.find(
            (s) =>
              s.tenantId === tenantId && s.userId === userId && s.accessTokenHash === accessTokenHash,
          ) ?? null
        );
      }
      return null;
    },
    findFirst: async ({ where }: { where: Record<string, unknown> }) => {
      return sessions.find((s) => matchesWhere({ ...s } as unknown as Record<string, unknown>, where)) ?? null;
    },
    findMany: async ({
      where,
      orderBy,
    }: {
      where: Record<string, unknown>;
      orderBy?: Record<string, string>;
    }) => {
      let rows = sessions.filter((s) => matchesWhere({ ...s } as unknown as Record<string, unknown>, where));
      if (orderBy?.lastActivityAt === 'asc') {
        rows = [...rows].sort((a, b) => a.lastActivityAt.getTime() - b.lastActivityAt.getTime());
      }
      if (orderBy?.createdAt === 'desc') {
        rows = [...rows].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return rows;
    },
    create: async ({ data }: { data: Partial<Row> }) => {
      const now = new Date();
      const row: Row = {
        id: `sess-${sessions.length + 1}`,
        createdAt: now,
        updatedAt: now,
        lastActivityAt: data.lastActivityAt ?? now,
        expiresAt: data.expiresAt ?? new Date(now.getTime() + 1000),
        isActive: data.isActive ?? true,
        tenantId: data.tenantId ?? 't1',
        userId: data.userId ?? '',
        accessTokenHash: data.accessTokenHash ?? '',
        refreshTokenHash: data.refreshTokenHash ?? '',
      };
      sessions.push(row);
      return row;
    },
    updateMany: async ({
      where,
      data,
    }: {
      where: Record<string, unknown>;
      data: Partial<Row>;
    }) => {
      const matched = sessions.filter((s) =>
        matchesWhere({ ...s } as unknown as Record<string, unknown>, where),
      );
      matched.forEach((s) => Object.assign(s, data));
      return { count: matched.length };
    },
  };

  const historyModel = {
    findUnique: async ({ where }: { where: Record<string, unknown> }) =>
      history.find((h) => h.refreshTokenHash === where.refreshTokenHash) ?? null,
    create: async ({ data }: { data: HistoryRow }) => {
      history.push({ ...data });
      return { ...data };
    },
  };

  const userModel = {
    findUnique: async ({ where }: { where: { id: string } }) => users[where.id] ?? null,
  };

  const prisma = {
    $transaction: async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({ session: sessionModel, refreshTokenHistory: historyModel, user: userModel }),
    session: sessionModel,
    refreshTokenHistory: historyModel,
    user: userModel,
  };

  return { prisma, sessions, history, users, sessionModel, historyModel };
}

function configStub(get: (path: string, def?: unknown) => unknown) {
  return { get } as never;
}

const EVENT_EMITTER_STUB = (() => {
  const calls: string[] = [];
  return {
    calls,
    emit: jest.fn((name: string) => calls.push(name)),
  };
})();

function makeService(prisma: ReturnType<typeof makeStore>['prisma'], cfg: ReturnType<typeof makeStore> | null = null) {
  const cache = {
    set: jest.fn(() => Promise.resolve(true)),
    del: jest.fn(() => Promise.resolve(true)),
    sadd: jest.fn(() => Promise.resolve(1)),
    srem: jest.fn(() => Promise.resolve(1)),
  };
  EVENT_EMITTER_STUB.calls.length = 0;
  EVENT_EMITTER_STUB.emit.mockClear();
  const service = new SessionService(
    prisma as never,
    cache as never,
    configStub((path, def) => {
      if (path === 'jwt.expiresIn') return '15m';
      if (path === 'jwt.refreshExpiresIn') return '7d';
      if (path === 'session.maxSessions') return 5;
      return def;
    }) as never,
    EVENT_EMITTER_STUB as never,
  );
  return { service, cache };
}

function activeUser(store: ReturnType<typeof makeStore>) {
  store.users['u1'] = { id: 'u1', status: 'ACTIVE', roles: [{ role: { name: 'PARENT' } }] };
}

function seedSession(
  store: ReturnType<typeof makeStore>,
  overrides: Partial<Row> = {},
): Row {
  const now = new Date();
  const row: Row = {
    id: overrides.id ?? `sess-${store.sessions.length + 50}`,
    tenantId: 't1',
    userId: 'u1',
    accessTokenHash: hashToken(generateToken()),
    refreshTokenHash: hashToken(generateToken()),
    isActive: true,
    lastActivityAt: now,
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  store.sessions.push(row);
  return row;
}

const emitNames = () => EVENT_EMITTER_STUB.calls;

describe('SessionService (B4 / P1.4)', () => {
  it('create() stores a DB session, indexes Redis and emits SessionCreated', async () => {
    const store = makeStore();
    activeUser(store);
    const { service, cache } = makeService(store.prisma);

    const accessToken = generateToken();
    const result = await service.create({
      tenantId: 't1',
      userId: 'u1',
      accessToken,
      ipAddress: '10.0.0.1',
      userAgent: 'jest',
    });

    expect(result.refreshToken.length).toBeGreaterThan(32);
    expect(store.sessions).toHaveLength(1);
    const row = store.sessions[0];
    expect(row.isActive).toBe(true);
    expect(row.accessTokenHash).toBe(hashToken(accessToken));
    expect(row.refreshTokenHash).toBe(hashToken(result.refreshToken));
    expect(cache.set).toHaveBeenCalledWith(
      `session:access:${hashToken(accessToken)}`,
      expect.objectContaining({ sessionId: row.id, tenantId: 't1', userId: 'u1' }),
      expect.objectContaining({ ttl: expect.any(Number) }),
    );
    expect(cache.sadd).toHaveBeenCalledWith('session:user:u1', row.id, expect.any(Number));
    expect(emitNames()).toContain(SessionEvents.Created);
  });

  it('create() revokes the oldest sessions when maxSessions is exceeded (never deletes)', async () => {
    const store = makeStore();
    const { service } = makeService(store.prisma);
    for (let i = 0; i < 5; i++) {
      seedSession(store, { lastActivityAt: new Date(1000 + i) });
    }
    const firstRow = store.sessions[0];

    await service.create({ tenantId: 't1', userId: 'u1', accessToken: generateToken() });

    const active = store.sessions.filter((s) => s.isActive);
    expect(active).toHaveLength(5);
    expect(store.sessions).toHaveLength(6);
    expect(store.sessions.find((s) => s.id === firstRow.id)?.isActive).toBe(false);
    expect(emitNames()).toContain(SessionEvents.Revoked);
  });

  it('rotate() issues new tokens atomically and records the consumed hash in history', async () => {
    const store = makeStore();
    activeUser(store);
    const seededToken = 'the-opaque-token-value';
    seedSession(store, { refreshTokenHash: hashToken(seededToken) });
    const { service, cache } = makeService(store.prisma);

    const rotated = await service.rotate(seededToken, () => Promise.resolve('access-2'));

    expect(rotated.refreshToken.length).toBeGreaterThan(32);
    const row = store.sessions[0];
    expect(row.refreshTokenHash).toBe(hashToken(rotated.refreshToken));
    expect(row.accessTokenHash).toBe(hashToken('access-2'));
    expect(store.history.some((h) => h.refreshTokenHash === hashToken(seededToken))).toBe(true);
    expect(emitNames()).toContain(SessionEvents.RefreshRotated);
    expect(cache.del).toHaveBeenCalled();
  });

  it('rotate() on a consumed (reused) token revokes the whole session', async () => {
    const store = makeStore();
    activeUser(store);
    const token = 'consumed-token-abc';
    const session = seedSession(store, { refreshTokenHash: hashToken('current-token') });
    store.history.push({
      sessionId: session.id,
      refreshTokenHash: hashToken(token),
      createdAt: new Date(),
    });

    const { service, cache } = makeService(store.prisma);
    await expect(service.rotate(token, () => Promise.resolve('x'))).rejects.toThrow();

    expect(store.sessions[0].isActive).toBe(false);
    expect(emitNames()).toContain(SessionEvents.RefreshReuseDetected);
    expect(emitNames()).toContain(SessionEvents.Revoked);
    expect(cache.del).toHaveBeenCalled();
  });

  it('rotate() on an unknown token is rejected with no side effects or events', async () => {
    const store = makeStore();
    activeUser(store);
    const { service } = makeService(store.prisma);

    await expect(service.rotate('never-issued', () => Promise.resolve('x'))).rejects.toThrow();
    expect(store.sessions).toHaveLength(0);
    expect(emitNames()).toHaveLength(0);
  });

  it('rotate() on an expired session transitions it inactive and emits SessionExpired', async () => {
    const store = makeStore();
    activeUser(store);
    const token = 'expired-token-abc';
    seedSession(store, {
      refreshTokenHash: hashToken(token),
      expiresAt: new Date(Date.now() - 1000),
    });

    const { service } = makeService(store.prisma);
    await expect(service.rotate(token, () => Promise.resolve('x'))).rejects.toThrow();
    expect(store.sessions[0].isActive).toBe(false);
    expect(emitNames()).toContain(SessionEvents.Expired);
  });

  it('lookupForAccess() requires an active, present, unexpired DB row', async () => {
    const store = makeStore();
    const token = generateToken();
    const hash = hashToken(token);
    seedSession(store, { accessTokenHash: hash, tenantId: 't1', userId: 'u1', isActive: true });
    const { service } = makeService(store.prisma);

    await expect(service.lookupForAccess('t1', 'u1', hash)).resolves.toEqual(
      expect.objectContaining({ id: expect.any(String) }),
    );
    await expect(service.lookupForAccess('t1', 'other', hash)).resolves.toBeNull();
    await expect(service.lookupForAccess('other', 'u1', hash)).resolves.toBeNull();
    await expect(service.lookupForAccess('t1', 'u1', hashToken(generateToken()))).resolves.toBeNull();

    store.sessions[0].isActive = false;
    await expect(service.lookupForAccess('t1', 'u1', hash)).resolves.toBeNull();
  });

  it('revokeCurrent() is idempotent, invalidates the access index and emits Logout + Revoked', async () => {
    const store = makeStore();
    const session = seedSession(store);
    const { service, cache } = makeService(store.prisma);

    await expect(
      service.revokeCurrent('t1', 'u1', session.id),
    ).resolves.toBe(true);
    expect(store.sessions[0].isActive).toBe(false);
    expect(emitNames()).toEqual([
      SessionEvents.Logout,
      SessionEvents.Revoked,
    ]);
    expect(cache.del).toHaveBeenCalled();

    await expect(service.revokeCurrent('t1', 'u1', session.id)).resolves.toBe(false);
    await expect(service.revokeCurrent('t1', 'other-user', session.id)).resolves.toBe(false);
  });

  it('sweepExpired() transitions only active+expired rows and emits SessionExpired', async () => {
    const store = makeStore();
    seedSession(store, { expiresAt: new Date(Date.now() - 5000) });
    seedSession(store, { expiresAt: new Date(Date.now() + 100000), isActive: true });
    seedSession(store, { expiresAt: new Date(Date.now() - 5000), isActive: false });

    const { service, cache } = makeService(store.prisma);
    const result = await service.sweepExpired();

    expect(result.revoked).toBe(1);
    expect(store.sessions[0].isActive).toBe(false);
    expect(emitNames()).toContain(SessionEvents.Expired);
    expect(cache.srem).toHaveBeenCalled();
  });

  it('accessTtlSeconds() reflects the config-driven 15-minute default (D-04)', async () => {
    const store = makeStore();
    const { service } = makeService(store.prisma);
    expect(service.accessTtlSeconds()).toBe(900);
  });
});