import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { createTestApp, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

const LOGIN = '/api/v1/auth/login';
const TENANT_SLUG = 'greenfield-academy';
const CORRECT_PASSWORD = 'Abcd1234!';

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

function post(app: INestApplication, email: string, password: string, tenantSlug = TENANT_SLUG) {
  return request(app.getHttpServer()).post(LOGIN).send({ email, password, tenantSlug });
}

describe('Login Protection B3 — D-09 / D-03 / P-16 / V-A-03 (e2e)', () => {
  describe('lockout and failure tracking (layer 2)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
      // Contract-level app: generous pre-auth limits (isolated 60s window),
      // max 3 recent failures (P-16 range), short 1.2s lock.
      applyEnv({
        THROTTLE_TTL: '60000',
        THROTTLE_LIMIT: '100000',
        THROTTLE_IDENTIFIER_LIMIT: '100000',
        LOGIN_MAX_ATTEMPTS: '3',
        LOGIN_FAILURE_WINDOW_MINUTES: '15',
        LOGIN_LOCK_MINUTES: '0.02',
      });
      app = await createTestApp();
      restoreEnv();
      prisma = app.get(PrismaService);
    }, 30000);

    afterAll(async () => {
      await closeTestApp(app);
    });

    it('returns tokens for a valid principal login (happy path unchanged)', async () => {
      const res = await post(app, 'principal@greenfield.edu.ng', 'Password@123').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.expiresIn).toBe(900);
    });

    it('returns an opaque 401 for wrong credentials (D-03)', async () => {
      const res = await post(app, 'teacher1@greenfield.edu.ng', 'wrong-password').expect(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    });

    it('returns a conformance-identical opaque 401 for an unknown tenant (D-03)', async () => {
      const unknownTenant = await post(app, 'principal@greenfield.edu.ng', 'Password@123', 'no-such-tenant').expect(401);
      const wrongPassword = await post(app, 'principal@greenfield.edu.ng', 'nope').expect(401);
      // Error visibility is identical across credential-failure classes (same
      // code, message, no details); only the per-request correlationId/timestamp
      // differ, which are excluded from the D-03 conformance comparison.
      expect(unknownTenant.body.error.code).toBe(wrongPassword.body.error.code);
      expect(unknownTenant.body.error.code).toBe('UNAUTHORIZED');
      expect(unknownTenant.body.error.message).toBe(wrongPassword.body.error.message);
      expect(unknownTenant.body.error.message).toBe('Invalid credentials');
      expect(unknownTenant.body.error.details).toBeUndefined();
      expect(JSON.stringify(unknownTenant.body)).not.toContain('principal');
    });

    it('locks the account once repeated failures reach the configured threshold (P-16/D-09)', async () => {
      const email = unique('lockme');
      const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
      const passwordHash = await bcrypt.hash(CORRECT_PASSWORD, 10);
      const user = await prisma.user.create({
        data: {
          tenantId: tenant!.id,
          email,
          passwordHash,
          firstName: 'Lock',
          lastName: 'Test',
        },
      });

      for (let i = 0; i < 3; i++) {
        const res = await post(app, email, 'wrong-password').expect(401);
        expect(res.body.error.code).toBe('UNAUTHORIZED');
      }

      const locked = await prisma.user.findUnique({ where: { id: user.id } });
      expect(locked?.lockedUntil).toBeDefined();
      expect(locked!.lockedUntil!.getTime()).toBeGreaterThan(Date.now());
    });

    it('returns 423 for an actually locked account even with the correct password (V-A-03)', async () => {
      const email = unique('locked423');
      const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
      const passwordHash = await bcrypt.hash(CORRECT_PASSWORD, 10);
      const user = await prisma.user.create({
        data: { tenantId: tenant!.id, email, passwordHash, firstName: 'Locked', lastName: 'User' },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { lockedUntil: new Date(Date.now() + 60_000) },
      });

      const res = await post(app, email, CORRECT_PASSWORD).expect(423);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatchObject({
        code: 'LOCKED',
        message: 'Account temporarily locked',
      });
      expect(res.body.error.details[0].retryAfter).toBeGreaterThan(0);
    });

    it('permits login again once an expired lock has passed, and clears the active lock state', async () => {
      const email = unique('lockexpiry');
      const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
      const passwordHash = await bcrypt.hash(CORRECT_PASSWORD, 10);
      const user = await prisma.user.create({
        data: { tenantId: tenant!.id, email, passwordHash, firstName: 'Expiring', lastName: 'Lock' },
      });

      for (let i = 0; i < 3; i++) {
        await post(app, email, 'wrong-password').expect(401);
      }
      await post(app, email, CORRECT_PASSWORD).expect(423);

      await new Promise((resolve) => setTimeout(resolve, 1500));
      const res = await post(app, email, CORRECT_PASSWORD).expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();

      const after = await prisma.user.findUnique({ where: { id: user.id } });
      expect(after?.lockedUntil).toBeNull();
      expect(after?.lastLoginAt).toBeDefined();
    });

    it('preserves historical login_attempts after a successful login (append-only)', async () => {
      const email = unique('history');
      const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
      const passwordHash = await bcrypt.hash(CORRECT_PASSWORD, 10);
      const user = await prisma.user.create({
        data: { tenantId: tenant!.id, email, passwordHash, firstName: 'History', lastName: 'Keep' },
      });

      for (let i = 0; i < 2; i++) {
        await post(app, email, 'wrong-password').expect(401);
      }
      await post(app, email, CORRECT_PASSWORD).expect(200);

      const rows = await prisma.loginAttempt.findMany({
        where: { tenantId: tenant!.id, email },
        orderBy: { createdAt: 'asc' },
      });

      expect(rows).toHaveLength(3);
      expect(rows.filter((row) => row.success === true)).toHaveLength(1);
      expect(rows.filter((row) => row.success === false)).toHaveLength(2);
      expect(rows.some((row) => row.userId === user.id)).toBe(true);
    });

    it('keeps lockout and failed-attempt tracking isolated per tenant (D-09 tenant-aware)', async () => {
      const email = unique('isolated');
      const tenant = await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } });
      const passwordHash = await bcrypt.hash(CORRECT_PASSWORD, 10);

      const other = await prisma.tenant.create({
        data: {
          name: 'Isolation High School',
          slug: `isolation-${Date.now()}`,
          subdomain: `isolation-${Date.now()}`,
        },
      });
      await prisma.user.create({
        data: { tenantId: tenant!.id, email, passwordHash, firstName: 'First', lastName: 'Tenant' },
      });
      await prisma.user.create({
        data: { tenantId: other.id, email, passwordHash, firstName: 'Second', lastName: 'Tenant' },
      });

      for (let i = 0; i < 3; i++) {
        await post(app, email, 'wrong-password', TENANT_SLUG).expect(401);
      }

      const firstTenantUser = await prisma.user.findFirst({
        where: { tenantId: tenant!.id, email },
      });
      expect(firstTenantUser?.lockedUntil).toBeDefined();

      const res = await post(app, email, CORRECT_PASSWORD, other.slug).expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();

      const otherFailures = await prisma.loginAttempt.count({
        where: { tenantId: other.id, email, success: false },
      });
      expect(otherFailures).toBe(0);

      const secondTenantUser = await prisma.user.findFirst({
        where: { tenantId: other.id, email },
      });
      expect(secondTenantUser?.lockedUntil).toBeNull();
    });
  });

  describe('IP + normalized-identifier throttle (layer 1)', () => {
    let app: INestApplication;

    beforeAll(async () => {
      applyEnv({
        THROTTLE_TTL: '60000',
        THROTTLE_LIMIT: '100000',
        THROTTLE_IDENTIFIER_LIMIT: '3',
      });
      app = await createTestApp();
      restoreEnv();
    }, 30000);

    afterAll(async () => {
      await closeTestApp(app);
    });

    it('returns 429 once the IP + identifier limit is exceeded', async () => {
      const email = unique('idrl');
      const first = await post(app, email, 'wrong').expect(401);
      const second = await post(app, email, 'wrong').expect(401);
      const third = await post(app, email, 'wrong').expect(401);
      expect(first.body.error.code).toBe('UNAUTHORIZED');
      expect(second.body.error.code).toBe('UNAUTHORIZED');
      expect(third.body.error.code).toBe('UNAUTHORIZED');

      const throttled = await post(app, email, 'wrong').expect(429);
      expect(throttled.body.success).toBe(false);
      expect(throttled.body.error).toMatchObject({
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests',
      });
      expect(throttled.body.error.details[0].retryAfter).toBeGreaterThanOrEqual(0);
    });

    it('maps casing variants of one identifier to the same normalized bucket', async () => {
      const ts = Date.now();
      const variants = [
        `CaseMix.${ts}@GREENFIELD.edu.ng`,
        `casemix.${ts}@Demo.edu.ng`,
        `CASEMIX.${ts}@greenfield.edu.ng`,
        `cAsEmIx.${ts}@GREENFIELD.edu.ng`,
      ];

      for (let i = 0; i < 3; i++) {
        await post(app, variants[i], 'wrong').expect(401);
      }

      const throttled = await post(app, variants[3], 'wrong').expect(429);
      expect(throttled.body.error.code).toBe('TOO_MANY_REQUESTS');
    });
  });

  describe('IP-based throttle (layer 1)', () => {
    let app: INestApplication;

    beforeAll(async () => {
      // Isolated 10-minute window scale so this app's IP bucket is not shared
      // with the other specs' fixed-window buckets.
      applyEnv({
        THROTTLE_TTL: '600000',
        THROTTLE_LIMIT: '2',
        THROTTLE_IDENTIFIER_LIMIT: '100000',
      });
      app = await createTestApp();
      restoreEnv();
    }, 30000);

    afterAll(async () => {
      await closeTestApp(app);
    });

    it('returns 429 once the IP-based limit is exceeded regardless of identifier', async () => {
      const first = await post(app, unique('ip1'), 'wrong').expect(401);
      const second = await post(app, unique('ip2'), 'wrong').expect(401);
      expect(first.body.error.code).toBe('UNAUTHORIZED');
      expect(second.body.error.code).toBe('UNAUTHORIZED');

      const throttled = await post(app, unique('ip3'), 'wrong').expect(429);
      expect(throttled.body.success).toBe(false);
      expect(throttled.body.error).toMatchObject({
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests',
      });
    });
  });
});