import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';
import { SessionService } from '../src/modules/session/session.service';
import { hashToken, generateToken } from '../src/modules/identity/identity.utils';
import { SessionEvents } from '../src/modules/session/session.events';

const BASE = '/api/v1';
const SLUG = 'greenfield-academy';
const PARENT = 'parent@greenfield.edu.ng';
const TEACHER = 'teacher1@greenfield.edu.ng';
const PASSWORD = 'Password@123';

const unique = (label: string) => `${label}.${Date.now()}@greenfield.edu.ng`;

let savedEnv: Record<string, string | undefined> = {};
function applyEnv(next: Record<string, string>): void {
  for (const [key, value] of Object.entries(next)) {
    savedEnv[key] = process.env[key];
    process.env[key] = value;
  }
}
function restoreEnv(): void {
  for (const [key, value] of Object.entries(savedEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  savedEnv = {};
}

let app: INestApplication;

/** Create a fresh, ordinary (non-privileged) user in the seed tenant. */
async function freshUser(prisma: PrismaService, label = 'b4'): Promise<string> {
  const tenant = await prisma.tenant.findUnique({ where: { slug: SLUG } });
  const email = unique(label);
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  await prisma.user.create({
    data: { tenantId: tenant!.id, email, passwordHash, firstName: 'B4', lastName: 'Test' },
  });
  return email;
}

describe('Sessions B4 — P1.4 (e2e)', () => {
  beforeAll(async () => {
    applyEnv({
      THROTTLE_TTL: '60000',
      THROTTLE_LIMIT: '100000',
      THROTTLE_IDENTIFIER_LIMIT: '100000',
    });
    app = await createTestApp();
    restoreEnv();
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('login and access control', () => {
    it('creates one authoritative active DB session per login (D-05)', async () => {
      const prisma = app.get(PrismaService);
      const email = await freshUser(prisma, 'd05');
      const before = await prisma.session.count({ where: { user: { email } } });
      const tokens = await loginAs(app, email);
      const after = await prisma.session.count({ where: { user: { email } } });

      expect(after).toBe(before + 1);
      const session = await prisma.session.findFirst({
        where: { user: { email } },
        orderBy: { createdAt: 'desc' },
      });
      expect(session?.isActive).toBe(true);
      expect(session!.accessTokenHash).toBe(hashToken(tokens.accessToken));
      expect(session!.refreshTokenHash).toBe(hashToken(tokens.refreshToken));
      expect(session!.ipAddress).toBeDefined();
      expect(session!.userAgent).toBeDefined();
    });

    it('accepts the issued access token on an authenticated route', async () => {
      const { accessToken } = await loginAs(app, PARENT);
      await request(app.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('rejects an access token whose session is absent from the DB', async () => {
      const prisma = app.get(PrismaService);
      const email = await freshUser(prisma, 'orphan');
      const { accessToken } = await loginAs(app, email);
      const user = await prisma.user.findFirst({ where: { email } });
      await prisma.session.deleteMany({ where: { userId: user!.id } });

      const res = await request(app.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(401);
    });
  });

  describe('refresh rotation (D-05 §6)', () => {
    it('rotates the access token and issues a brand-new single-use refresh token', async () => {
      const prisma = app.get(PrismaService);
      const { refreshToken: oldRefresh } = await loginAs(app, TEACHER);

      const sessionBefore = await prisma.session.findFirst({
        where: { refreshTokenHash: hashToken(oldRefresh) },
      });
      expect(sessionBefore).not.toBeNull();

      const rotated = await request(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken: oldRefresh })
        .expect(200);

      expect(rotated.body.success).toBe(true);
      expect(rotated.body.data.accessToken).toBeDefined();
      expect(rotated.body.data.refreshToken).toBeDefined();
      expect(rotated.body.data.refreshToken).not.toBe(oldRefresh);
      expect(rotated.body.data.expiresIn).toBe(900);

      const after = await prisma.session.findFirst({ where: { id: sessionBefore!.id } });
      expect(after!.refreshTokenHash).toBe(hashToken(rotated.body.data.refreshToken));
      expect(after!.accessTokenHash).toBe(hashToken(rotated.body.data.accessToken));

      const history = await prisma.refreshTokenHistory.count({
        where: { sessionId: sessionBefore!.id, refreshTokenHash: hashToken(oldRefresh) },
      });
      expect(history).toBe(1);

      await request(app.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${rotated.body.data.accessToken}`)
        .expect(200);
    });

    it('rejects a reused (already-consumed) refresh token with an opaque 401', async () => {
      const { refreshToken } = await loginAs(app, TEACHER);
      await request(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken })
        .expect(200);

      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken })
        .expect(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid refresh token',
      });
      expect(res.body.error.details).toBeUndefined();
    });

    it('rejects an unknown (never-issued) refresh token with no side effects', async () => {
      const prisma = app.get(PrismaService);
      const before = await prisma.session.count({ where: { isActive: true } });
      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken: generateToken() })
        .expect(401);
      expect(res.body).toMatchObject({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
      expect(await prisma.session.count({ where: { isActive: true } })).toBe(before);
    });

    it('rejects the refresh token of a logged-out session', async () => {
      const tokens = await loginAs(app, PARENT);
      await request(app.getHttpServer())
        .post(`${BASE}/auth/logout`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken: tokens.refreshToken })
        .expect(401);
      expect(res.body).toMatchObject({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
    });

    it('revokes the WHOLE session when the same refresh token is replayed concurrently', async () => {
      const prisma = app.get(PrismaService);
      const email = await freshUser(prisma, 'race');
      const { refreshToken } = await loginAs(app, email);
      const user = await prisma.user.findFirst({ where: { email } });
      const session = await prisma.session.findFirst({
        where: { userId: user!.id },
        orderBy: { createdAt: 'desc' },
      });

      const attempts = await Promise.all([
        request(app.getHttpServer()).post(`${BASE}/auth/refresh`).send({ refreshToken }),
        request(app.getHttpServer()).post(`${BASE}/auth/refresh`).send({ refreshToken }),
      ]);

      const statuses = attempts.map((r) => r.status);
      expect(statuses).toContain(200);
      expect(statuses).toContain(401);

      expect((await prisma.session.findUnique({ where: { id: session!.id } }))?.isActive).toBe(false);

      const winner = attempts.find((r) => r.status === 200)!;
      const me = await request(app.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${winner.body.data.accessToken}`);
      expect(me.status).toBe(401);
    });
  });

  describe('session listing and revocation (spec §9.8)', () => {
    it('lists only the caller\'s own sessions, exposing no token material', async () => {
      const prisma = app.get(PrismaService);
      const tokens = await loginAs(app, PARENT);
      await loginAs(app, TEACHER);

      const res = await request(app.getHttpServer())
        .get(`${BASE}/sessions`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const sessions = res.body.data.sessions as Record<string, unknown>[];
      expect(Array.isArray(sessions)).toBe(true);
      expect(JSON.stringify(res.body)).not.toMatch(/TokenHash/);

      const principal = await prisma.user.findFirst({ where: { email: PARENT } });
      for (const s of sessions) {
        const row = await prisma.session.findFirst({ where: { id: String(s.id) } });
        expect(row!.userId).toBe(principal!.id);
        expect(row!.tenantId).toBe(principal!.tenantId);
      }
    });

    it('revokes an individual session by id, leaving newer sessions active', async () => {
      const prisma = app.get(PrismaService);
      const email = await freshUser(prisma, 'revokeone');
      await loginAs(app, email);
      const t2 = await loginAs(app, email);
      const user = await prisma.user.findFirst({ where: { email } });
      const sessions = await prisma.session.findMany({
        where: { userId: user!.id },
        orderBy: { createdAt: 'desc' },
      });
      expect(sessions.length).toBeGreaterThanOrEqual(2);

      const oldest = sessions[sessions.length - 1];
      await request(app.getHttpServer())
        .delete(`${BASE}/sessions/${oldest.id}`)
        .set('Authorization', `Bearer ${t2.accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${t2.accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .delete(`${BASE}/sessions/${oldest.id}`)
        .set('Authorization', `Bearer ${t2.accessToken}`)
        .expect(404);
    });

    it('log-out of one device invalidates that device only', async () => {
      const prisma = app.get(PrismaService);
      const email = await freshUser(prisma, 'logoutone');
      const t1 = await loginAs(app, email);
      const t2 = await loginAs(app, email);
      const user = await prisma.user.findFirst({ where: { email } });
      const sessions = await prisma.session.findMany({
        where: { userId: user!.id },
        orderBy: { createdAt: 'desc' },
      });
      const newest = sessions[0];

      await request(app.getHttpServer())
        .post(`${BASE}/auth/logout`)
        .set('Authorization', `Bearer ${t1.accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${t1.accessToken}`)
        .expect(401);
      await request(app.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${t2.accessToken}`)
        .expect(200);
      expect((await prisma.session.findUnique({ where: { id: newest.id } }))?.isActive).toBe(true);
    });

    it('log-out-all revokes every active session for the caller (this tenant)', async () => {
      const prisma = app.get(PrismaService);
      const email = await freshUser(prisma, 'logoutall');
      const t1 = await loginAs(app, email);
      const t2 = await loginAs(app, email);
      const user = await prisma.user.findFirst({ where: { email } });

      const res = await request(app.getHttpServer())
        .delete(`${BASE}/sessions`)
        .set('Authorization', `Bearer ${t1.accessToken}`)
        .expect(200);
      expect(res.body.data).toMatchObject({ revoked: 2 });

      await request(app.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${t1.accessToken}`)
        .expect(401);
      await request(app.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${t2.accessToken}`)
        .expect(401);

      expect(
        await prisma.session.count({ where: { userId: user!.id, isActive: true } }),
      ).toBe(0);
    });
  });

  describe('max concurrent sessions (ADR-013 / D-05 limit)', () => {
    let limitedApp: INestApplication;

    beforeAll(async () => {
      applyEnv({
        THROTTLE_TTL: '60000',
        THROTTLE_LIMIT: '100000',
        THROTTLE_IDENTIFIER_LIMIT: '100000',
        SESSION_MAX_SESSIONS: '2',
      });
      limitedApp = await createTestApp();
      restoreEnv();
    }, 30000);

    afterAll(async () => {
      await closeTestApp(limitedApp);
    });

    it('keeps only the newest sessions active and revokes the oldest on over-limit login', async () => {
      const prisma = limitedApp.get(PrismaService);
      const email = await freshUser(prisma, 'cap');
      const t1 = await loginAs(limitedApp, email);
      const t2 = await loginAs(limitedApp, email);
      const t3 = await loginAs(limitedApp, email);
      const user = await prisma.user.findFirst({ where: { email } });

      const rows = await prisma.session.findMany({
        where: { userId: user!.id },
        orderBy: { createdAt: 'desc' },
      });
      expect(rows).toHaveLength(3);
      expect(rows.filter((r) => r.isActive)).toHaveLength(2);

      await request(limitedApp.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${t1.accessToken}`)
        .expect(401);
      await request(limitedApp.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${t3.accessToken}`)
        .expect(200);
      void t2;
    });
  });

  describe('events (D-08 / spec §9.6) and cleanup (I-22)', () => {
    it('emits SessionCreated / RefreshRotated / SessionExpired, then sweep is idempotent', async () => {
      const emitter = app.get(EventEmitter2);
      const prisma = app.get(PrismaService);
      const service = app.get(SessionService);
      const seen: string[] = [];
      const capture = (name: string) => () => seen.push(name);
      emitter.on(SessionEvents.Created, capture(SessionEvents.Created) as never);
      emitter.on(SessionEvents.RefreshRotated, capture(SessionEvents.RefreshRotated) as never);
      emitter.on(SessionEvents.Expired, capture(SessionEvents.Expired) as never);

      const email = await freshUser(prisma, 'evt');
      const tokens = await loginAs(app, email);
      const user = await prisma.user.findFirst({ where: { email } });
      await request(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken: tokens.refreshToken })
        .expect(200);

      const session = await prisma.session.findFirst({
        where: { userId: user!.id },
        orderBy: { createdAt: 'desc' },
      });
      await prisma.session.update({
        where: { id: session!.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });
      const first = await service.sweepExpired(user!.tenantId);
      expect(first.revoked).toBe(1);
      expect(first.sessionIds).toContain(session!.id);
      expect(await service.sweepExpired(user!.tenantId)).toEqual({ revoked: 0, sessionIds: [] });

      expect(seen).toEqual([
        SessionEvents.Created,
        SessionEvents.RefreshRotated,
        SessionEvents.Expired,
      ]);
    });

    it('sweepExpired() never touches active unexpired sessions', async () => {
      const prisma = app.get(PrismaService);
      const service = app.get(SessionService);
      const email = await freshUser(prisma, 'sweep');
      await loginAs(app, email);
      const user = await prisma.user.findFirst({ where: { email } });

      const result = await service.sweepExpired(user!.tenantId);
      expect(result.revoked).toBe(0);

      expect(
        await prisma.session.count({ where: { userId: user!.id, isActive: true } }),
      ).toBe(1);
    });
  });

  describe('user lifecycle integration', () => {
    it('a non-ACTIVE user cannot authenticate; deactivation primitive revokes all sessions', async () => {
      const prisma = app.get(PrismaService);
      const service = app.get(SessionService);
      const email = await freshUser(prisma, 'suspend');
      const tokens = await loginAs(app, email);
      const user = await prisma.user.findFirst({ where: { email } });

      await prisma.user.update({
        where: { id: user!.id },
        data: { status: 'SUSPENDED' },
      });

      const me = await request(app.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${tokens.accessToken}`);
      expect(me.status).toBe(401);

      const refresh = await request(app.getHttpServer())
        .post(`${BASE}/auth/refresh`)
        .send({ refreshToken: tokens.refreshToken });
      expect(refresh.status).toBe(401);

      const count = await service.revokeAllSessionsForUser(user!.id);
      expect(count).toBeGreaterThanOrEqual(1);
      expect(
        await prisma.session.count({ where: { userId: user!.id, isActive: true } }),
      ).toBe(0);
    });
  });
});