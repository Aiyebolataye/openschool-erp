import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

const BASE = '/api/v1';
const TENANT_SLUG = 'greenfield-academy';

describe('Audit log persistence + read-only API (P1.7 / D-B5-2/3/4)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let adminEmail: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    adminEmail = 'admin@greenfield.edu.ng';

    // A fresh admin login guarantees at least one LoginSucceeded row for this
    // admin in THIS run.
    const tokens = await loginAs(app, adminEmail);
    adminToken = tokens.accessToken;
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('persists a LoginSucceeded audit row with actor email and correlation id', async () => {
    const rows = await prisma.auditLog.findMany({
      where: { tenantId: (await tenant()).id, action: 'auth.login.succeeded', actorId: (await adminUser()).id },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    expect(rows.length).toBeGreaterThan(0);
    const row = rows[0];
    expect(row.actorEmail).toBe(adminEmail);
    expect(row.entityType).toBe('user');
    expect(row.changes).toEqual({ method: 'password' });
    expect(row.correlationId).toBeTruthy();
  });

  it('persists an audit row for a failed login with a server-side reason', async () => {
    const sentAt = new Date();

    await request(app.getHttpServer())
      .post(`${BASE}/auth/login`)
      .send({ email: adminEmail, password: 'definitely-wrong', tenantSlug: TENANT_SLUG })
      .expect(401);

    // The consumer records async (fire-and-forget), so retry a few times
    // instead of asserting immediately after the HTTP round trip.
    let row: Awaited<ReturnType<typeof prisma.auditLog.findFirst>> | null = null;
    for (let i = 0; i < 20 && !row; i++) {
      row = await prisma.auditLog.findFirst({
        where: {
          action: 'auth.login.failed',
          actorEmail: adminEmail,
          createdAt: { gte: sentAt },
          changes: { path: ['reason'], equals: 'invalid-password' },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (!row) await new Promise((r) => setTimeout(r, 200));
    }

    expect(row).not.toBeNull();
    expect(row!.actorEmail).toBe(adminEmail);
  });

  it('lists audit entries with the locked flat envelope when authorized', async () => {
    const res = await request(app.getHttpServer())
      .get(`${BASE}/audit-logs`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toBeInstanceOf(Array);
    expect(typeof res.body.data.total).toBe('number');
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(20);
    expect(res.body.data.meta).toBeUndefined();
    expect(res.body.data.total).toBeGreaterThan(0);
    expect(res.body.data.items[0]).toMatchObject({
      action: expect.any(String),
      entityType: expect.any(String),
      tenantId: expect.any(String),
    });
  });

  it('supports action filtering on the list endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get(`${BASE}/audit-logs?action=auth.login.succeeded`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data.total).toBeGreaterThan(0);
    for (const item of res.body.data.items) {
      expect(item.action).toBe('auth.login.succeeded');
    }
  });

  it('returns a single entry by id for an authorized admin', async () => {
    const id = (await prisma.auditLog.findFirst({ orderBy: { createdAt: 'desc' } }))!.id;

    const res = await request(app.getHttpServer())
      .get(`${BASE}/audit-logs/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(id);
  });

  it('returns 404 for an audit entry in another tenant or unknown id', async () => {
    await request(app.getHttpServer())
      .get(`${BASE}/audit-logs/00000000-0000-0000-0000-000000000000`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });

  it('denies listing without authentication (401)', async () => {
    const res = await request(app.getHttpServer()).get(`${BASE}/audit-logs`).expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('denies listing to a user without the audit permission (403)', async () => {
    const teacher = await loginAs(app, 'teacher1@greenfield.edu.ng');
    const res = await request(app.getHttpServer())
      .get(`${BASE}/audit-logs`)
      .set('Authorization', `Bearer ${teacher.accessToken}`)
      .expect(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('scopes rows to the caller tenant (no cross-tenant leakage)', async () => {
    const other = await prisma.tenant.create({
      data: {
        name: `Audit Iso ${Date.now()}`,
        slug: `audit-iso-${Date.now()}`,
        subdomain: `audit-iso-${Date.now()}`,
      },
    });
    const institutionAdmin = await prisma.role.findUnique({
      where: { name: 'INSTITUTION_ADMIN' },
    });
    if (!institutionAdmin) throw new Error('INSTITUTION_ADMIN role missing');
    const user = await prisma.user.create({
      data: {
        tenantId: other.id,
        email: `auditor-${Date.now()}@${other.slug}.edu.ng`,
        passwordHash: await bcrypt.hash('Password@123', 10),
        firstName: 'Remote',
        lastName: 'Auditor',
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        roles: { create: { tenantId: other.id, roleId: institutionAdmin.id } },
      },
    });
    await prisma.organizationMembership.create({
      data: { tenantId: other.id, userId: user.id, status: 'ACTIVE' },
    });
    const tokens = await loginAs(app, user.email, 'Password@123', other.slug);

    // loginAs() persists an `auth.login.succeeded` row fire-and-forget, so the
    // consumer may flush a hair after the HTTP round trip. Poll the list (bounded)
    // rather than asserting immediately.
    let res: { body: { data: { total: number; items: { tenantId: string; actorEmail: string }[] } } } | null =
      null;
    for (let i = 0; i < 20; i++) {
      res = (await request(app.getHttpServer())
        .get(`${BASE}/audit-logs`)
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .expect(200)) as any;
      if (res!.body.data.total >= 1) break;
      await new Promise((r) => setTimeout(r, 200));
    }
    res = res! as any;

    // The caller is an INSTITUTION_ADMIN in the *other* org. LoginAs performs
    // a successful login, which itself persists an `auth.login.succeeded` row
    // in the caller's OWN org — so total is 1+, but the absolute guarantee is
    // tenant isolation: no rows owned by the greenfield seed tenant may leak.
    const body = res!.body as { data: { total: number; items: { tenantId: string; actorEmail: string }[] } };
    expect(body.data.total).toBeGreaterThanOrEqual(1);
    for (const item of body.data.items) {
      expect(item.tenantId).toBe(other.id);
      expect(item.actorEmail).not.toBe(adminEmail);
      expect(item.actorEmail).not.toMatch(/@greenfield\.edu\.ng$/);
    }
  });

  it('enforces append-only immutability at the database level', async () => {
    const row = await prisma.auditLog.findFirst({ orderBy: { createdAt: 'desc' } });
    expect(row).not.toBeNull();

    await expect(
      prisma.auditLog.update({
        where: { id: row!.id },
        data: { action: 'tampered' },
      }),
    ).rejects.toThrow(/append-only/);

    const [trigger] = await prisma.$queryRawUnsafe<{ tgname: string }[]>(
      `SELECT tgname FROM pg_trigger WHERE tgrelid = 'audit_logs'::regclass AND tgname = 'audit_logs_append_only'`,
    );
    expect(trigger).toBeTruthy();
  });

  async function tenant() {
    return (await prisma.tenant.findUnique({ where: { slug: TENANT_SLUG } }))!;
  }

  async function adminUser() {
    return (await prisma.user.findUnique({
      where: { tenantId_email: { tenantId: (await tenant()).id, email: adminEmail } },
    }))!;
  }
});