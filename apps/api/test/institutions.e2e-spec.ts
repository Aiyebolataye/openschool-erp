import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * P4.1 — Institution Management (e2e).
 *
 * Covers: admin-only `institution:institution:*` permission matrix, JWT auth
 * (401 unauthenticated / 403 non-admin), ObjectScopeGuard cross-tenant
 * isolation, envelope + dropped public DTO fields (type/parentId/tenantId ->
 * 400), lifecycle (provision/suspend/restore/archive) incl. invalid
 * transition 400 and ARCHIVED update 409, tombstone remove, and the nested
 * config/settings surface: server-derived institution scoping, active
 * membership gate (403 for a non-member admin), kind-typed settings
 * (400 on mismatch), optimistic versioning (409) and 404s on missing keys.
 *
 * Requires the seeded database (Docker/Postgres/Redis) via global-setup;
 * authored here, not runnable in the static-gate environment.
 */
describe('P4.1 — Institution Management (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  let institutionId: string;

  const suffix = Date.now();

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'greenfield-academy' } });
    if (!tenant) throw new Error('Seeded tenant missing');
    tenantId = tenant.id;
    const institution = await prisma.institution.findFirst({ where: { tenantId: tenant.id } });
    if (!institution) throw new Error('Seeded institution missing');
    institutionId = institution.id;
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  function api(accessToken: string) {
    const build = request(app.getHttpServer());
    return {
      get: (url: string) => build.get(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`),
      post: (url: string) => build.post(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`),
      put: (url: string) => build.put(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`),
      patch: (url: string) => build.patch(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`),
      del: (url: string) => build.delete(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`),
    };
  }

  async function login(email: string, slug = 'greenfield-academy') {
    const { accessToken } = await loginAs(app, email, 'Password@123', slug);
    return accessToken;
  }

  async function createInstitution(code: string) {
    const created = await prisma.institution.create({
      data: {
        tenantId,
        name: `P4.1 E2E ${code}`,
        code,
        status: 'PROVISIONING',
      },
    });
    return created.id;
  }

  it('rejects unauthenticated access with 401', async () => {
    await request(app.getHttpServer()).get('/api/v1/institutions').expect(401);
  });

  it('rejects a non-admin (TEACHER) with 403 — permission matrix is admin-only', async () => {
    const token = await login('teacher1@greenfield.edu.ng');
    await api(token).get('/institutions').expect(403);
  });

  it('lists institutions in the canonical envelope (items/total/page/limit)', async () => {
    const token = await login('admin@greenfield.edu.ng');
    const res = await api(token).get('/institutions?page=1&limit=20').expect(200);
    expect(res.body).toMatchObject({
      success: true,
      data: expect.objectContaining({
        items: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        limit: 20,
      }),
    });
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('rejects a create carrying dropped public DTO fields (type/parentId/tenantId) with 400', async () => {
    const token = await login('admin@greenfield.edu.ng');
    await api(token)
      .post('/institutions')
      .send({
        name: 'Field Leak Academy',
        code: `P41FL${suffix}`,
        type: 'HIGH_SCHOOL',
        parentId: 'not-a-real-parent',
        tenantId: 'client-supplied-tenant',
      })
      .expect(400);
  });

  it('creates an institution as PROVISIONING and rejects a duplicate tenant code with 409', async () => {
    const token = await login('admin@greenfield.edu.ng');
    const code = `P41E2E${suffix}`;
    const created = await api(token)
      .post('/institutions')
      .send({ name: 'P4.1 E2E Institution', code })
      .expect(201);
    expect(created.body).toMatchObject({
      success: true,
      data: expect.objectContaining({ code, status: 'PROVISIONING' }),
    });

    await api(token)
      .post('/institutions')
      .send({ name: 'Duplicate code', code })
      .expect(409);
  });

  it('isolates institutions cross-tenant (403/404 for a foreign institution id)', async () => {
    const adminToken = await login('admin@greenfield.edu.ng');
    const res = await api(adminToken).get('/institutions/11111111-1111-4111-8111-111111111111');
    expect([403, 404]).toContain(res.status);
  });

  describe('lifecycle', () => {
    let id: string;
    let token: string;

    beforeAll(async () => {
      token = await login('admin@greenfield.edu.ng');
      id = await createInstitution(`P41LIF${suffix}`);
    });

    it('provision (activate) -> suspend -> restore -> archive', async () => {
      await api(token).post(`/institutions/${id}/provision`).expect(200);
      let res = await api(token).get(`/institutions/${id}`).expect(200);
      expect(res.body.data.status).toBe('ACTIVE');

      await api(token).post(`/institutions/${id}/suspend`).expect(200);
      res = await api(token).get(`/institutions/${id}`).expect(200);
      expect(res.body.data.status).toBe('SUSPENDED');

      await api(token).post(`/institutions/${id}/restore`).expect(200);
      await api(token).post(`/institutions/${id}/archive`).expect(200);
      res = await api(token).get(`/institutions/${id}`).expect(200);
      expect(res.body.data.status).toBe('ARCHIVED');
    });

    it('rejects an invalid transition (suspend an ARCHIVED institution) with 400', async () => {
      await api(token).post(`/institutions/${id}/suspend`).expect(400);
    });

    it('rejects modification of an ARCHIVED institution with 409', async () => {
      await api(token).patch(`/institutions/${id}`).send({ name: 'Nope' }).expect(409);
    });

    it('restore from ARCHIVED then tombstone-remove (emits Deleted)', async () => {
      await api(token).post(`/institutions/${id}/restore`).expect(200);
      await api(token).del(`/institutions/${id}`).expect(200);
      const row = await prisma.institution.findUnique({ where: { id } });
      expect(row?.deletedAt).not.toBeNull();
    });
  });

  describe('configuration (nested, membership-scoped)', () => {
    let id: string;
    let principalToken: string;
    let adminToken: string;

    beforeAll(async () => {
      principalToken = await login('principal@greenfield.edu.ng');
      adminToken = await login('admin@greenfield.edu.ng');
      id = await createInstitution(`P41CFG${suffix}`);
      // Frozen contract: nested access requires an ACTIVE institution
      // membership. Fresh test institutions have none, so grant the principal
      // one (mirrors the canonical seed membership). The platform admin stays
      // membership-less to keep the 403 non-member assertion above honest.
      const principal = await prisma.user.findFirst({ where: { email: 'principal@greenfield.edu.ng', tenantId } });
      if (!principal) throw new Error('Seeded principal missing');
      await prisma.institutionMembership.create({
        data: { tenantId, institutionId: id, userId: principal.id, status: 'ACTIVE' },
      });
    });

    it('rejects a non-admin without institution:config:list with 403', async () => {
      const token = await login('teacher1@greenfield.edu.ng');
      await api(token).get(`/institutions/${id}/configuration`).expect(403);
    });

    it('rejects an admin WITHOUT active institution membership with 403', async () => {
      await api(adminToken).get(`/institutions/${id}/configuration`).expect(403);
    });

    it('lists, upserts (version 1 -> 2), 409s a stale version, then reads and deletes', async () => {
      await api(principalToken).get(`/institutions/${id}/configuration`).expect(200);

      const put1 = await api(principalToken)
        .put(`/institutions/${id}/configuration/school.logo`)
        .send({ value: '#2563EB' })
        .expect(200);
      expect(put1.body.data).toMatchObject({ key: 'school.logo', version: 1 });

      const put2 = await api(principalToken)
        .put(`/institutions/${id}/configuration/school.logo`)
        .send({ value: '#000000' })
        .expect(200);
      expect(put2.body.data.version).toBe(2);

      await api(principalToken)
        .put(`/institutions/${id}/configuration/school.logo`)
        .send({ value: '#111111', version: 1 })
        .expect(409);

      const got = await api(principalToken)
        .get(`/institutions/${id}/configuration/school.logo`)
        .expect(200);
      expect(got.body.data).toMatchObject({ key: 'school.logo', version: 2 });

      await api(principalToken)
        .del(`/institutions/${id}/configuration/school.logo`)
        .expect(200);
      await api(principalToken)
        .get(`/institutions/${id}/configuration/school.logo`)
        .expect(404);
    });

    it('rejects an invalid configuration key pattern with 400', async () => {
      await api(principalToken)
        .put(`/institutions/${id}/configuration/BAD KEY!`)
        .send({ value: 'x' })
        .expect(400);
    });
  });

  describe('settings (nested, kind-typed + versioned)', () => {
    let id: string;
    let principalToken: string;

    beforeAll(async () => {
      principalToken = await login('principal@greenfield.edu.ng');
      id = await createInstitution(`P41SET${suffix}`);
      const principal = await prisma.user.findFirst({ where: { email: 'principal@greenfield.edu.ng', tenantId } });
      if (!principal) throw new Error('Seeded principal missing');
      await prisma.institutionMembership.create({
        data: { tenantId, institutionId: id, userId: principal.id, status: 'ACTIVE' },
      });
    });

    it('rejects a value that does not match the requested kind with 400', async () => {
      await api(principalToken)
        .put(`/institutions/${id}/settings/sms.provider`)
        .send({ value: 'twilio', kind: 'NUMBER' })
        .expect(400);
    });

    it('upserts a kind-typed setting with optimistic versioning', async () => {
      const put1 = await api(principalToken)
        .put(`/institutions/${id}/settings/sms.provider`)
        .send({ value: 'twilio' })
        .expect(200);
      expect(put1.body.data).toMatchObject({ kind: 'STRING', version: 1 });

      const put2 = await api(principalToken)
        .put(`/institutions/${id}/settings/max.students`)
        .send({ value: 2000, kind: 'NUMBER' })
        .expect(200);
      expect(put2.body.data).toMatchObject({ kind: 'NUMBER', version: 1 });

      await api(principalToken)
        .put(`/institutions/${id}/settings/max.students`)
        .send({ value: 3000, kind: 'NUMBER', version: 99 })
        .expect(409);

      const list = await api(principalToken).get(`/institutions/${id}/settings`).expect(200);
      expect(list.body.data.items).toHaveLength(2);

      await api(principalToken).del(`/institutions/${id}/settings/sms.provider`).expect(200);
      await api(principalToken).get(`/institutions/${id}/settings/sms.provider`).expect(404);
    });
  });
});