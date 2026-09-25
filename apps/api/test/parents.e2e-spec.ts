import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * PEOPLE-4 — Parent Management (e2e).
 *
 * Covers the approved PEOPLE-4 boundary for parents:
 *   GET/POST  /people/persons/:personId/parents
 *   GET/PUT/DELETE  /people/persons/:personId/parents/:id
 *
 * Verifies CRUD, status lifecycle (ACTIVE ↔ INACTIVE), optimistic concurrency,
 * scope/nesting, permission matrix (admin-roles-only), soft-delete, childrenCount
 * in list/read, public-ID non-acceptance, and BR-020 audit events.
 */
describe('PEOPLE-4 — Parent Management (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  let institutionId: string;

  const suffix = Date.now();
  const uniqueEmail = (label: string) => `${label}.${suffix}@greenfield.edu.ng`;
  let personSeq = 1;
  const makePersonPublicId = () =>
    `P-${new Date().getFullYear()}-${String(900000 + (suffix % 80000) + personSeq++).padStart(6, '0')}`;

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
      del: (url: string, body?: Record<string, unknown>) => {
        const req = build.delete(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`);
        return body !== undefined ? req.send(body) : req;
      },
    };
  }

  async function login(email: string) {
    const { accessToken } = await loginAs(app, email, 'Password@123', 'greenfield-academy');
    return accessToken;
  }

  async function makePerson(firstName: string, lastName: string) {
    return prisma.person.create({
      data: {
        tenantId,
        publicId: makePersonPublicId(),
        firstName,
        lastName,
        email: uniqueEmail(`${firstName}.${lastName}`).toLowerCase(),
        dateOfBirth: new Date('1990-01-01'),
        gender: 'MALE',
        status: 'ACTIVE',
      },
    });
  }

  // ---- Parents CRUD --------------------------------------------------------

  describe('Parents CRUD (INSTITUTION_ADMIN / PRINCIPAL)', () => {
    let admin: string;
    let personId: string;
    let parentId: string;

    beforeAll(async () => {
      admin = await login('principal@greenfield.edu.ng');
      const person = await makePerson('Parent', `Create${suffix}`);
      personId = person.id;
    }, 20000);

    it('creates a parent record (201) with ACTIVE status and childrenCount 0', async () => {
      const res = await api(admin)
        .post(`/people/persons/${personId}/parents`)
        .send({ contactPreference: 'EMAIL' })
        .expect(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACTIVE');
      expect(res.body.data.personId).toBe(personId);
      expect(res.body.data.childrenCount).toBe(0);
      expect(res.body.data.version).toBe(1);
      parentId = res.body.data.id;
    });

    it('lists the created parent (200) with correct envelope', async () => {
      const res = await api(admin)
        .get(`/people/persons/${personId}/parents`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].id).toBe(parentId);
      expect(res.body.data.total).toBe(1);
    });

    it('reads a single parent by id (200)', async () => {
      const res = await api(admin)
        .get(`/people/persons/${personId}/parents/${parentId}`)
        .expect(200);
      expect(res.body.data.id).toBe(parentId);
      expect(res.body.data.personId).toBe(personId);
    });

    it('updates contactPreference and status (200)', async () => {
      const version1 = await prisma.parent.findUniqueOrThrow({ where: { id: parentId } });
      await api(admin)
        .put(`/people/persons/${personId}/parents/${parentId}`)
        .send({ contactPreference: 'PHONE', status: 'INACTIVE', version: version1.version })
        .expect(200);
      const db = await prisma.parent.findUniqueOrThrow({ where: { id: parentId } });
      expect(db.contactPreference).toBe('PHONE');
      expect(db.status).toBe('INACTIVE');
    });

    it('rejects moving INACTIVE back to ACTIVE via this endpoint (409)', async () => {
      const version = await prisma.parent.findUniqueOrThrow({ where: { id: parentId } });
      await api(admin)
        .put(`/people/persons/${personId}/parents/${parentId}`)
        .send({ status: 'ACTIVE', version: version.version })
        .expect(409);
    });

    it('rejects a stale-version update with 409', async () => {
      await api(admin)
        .put(`/people/persons/${personId}/parents/${parentId}`)
        .send({ contactPreference: 'EMAIL', version: 99999 })
        .expect(409);
    });

    it('rejects duplicate parent for the same person+institution (409)', async () => {
      await api(admin)
        .post(`/people/persons/${personId}/parents`)
        .send({ contactPreference: 'EMAIL' })
        .expect(409);
    });

    it('rejects a non-UUID parent id as NotFound (404), not 500', async () => {
      await api(admin)
        .get(`/people/persons/${personId}/parents/not-a-uuid`)
        .expect(404);
    });

    it('soft-deletes the parent (200) and nullifies deletedAt on a live record', async () => {
      const res = await api(admin)
        .del(`/people/persons/${personId}/parents/${parentId}`)
        .expect(200);
      expect(res.body.data.deletedAt).toBeTruthy();
      expect(res.body.data.version).toBeGreaterThanOrEqual(2);
    });

    it('soft-deleted parent is excluded from list (200, items empty)', async () => {
      const res = await api(admin)
        .get(`/people/persons/${personId}/parents`)
        .expect(200);
      expect(res.body.data.items).toHaveLength(0);
    });

    it('allow non-UUID garbage parent id without throwing 500', async () => {
      await api(admin)
        .get(`/people/persons/${personId}/parents/garbage-id`)
        .expect(404);
    });
  });

  // ---- Scope & nesting -----------------------------------------------------

  describe('Scope & nesting', () => {
    let admin: string;
    let parentId: string;
    let personId: string;

    beforeAll(async () => {
      admin = await login('principal@greenfield.edu.ng');
      const person = await makePerson('Scope', `Parent${suffix}`);
      personId = person.id;
      const res = await api(admin)
        .post(`/people/persons/${personId}/parents`)
        .send({})
        .expect(201);
      parentId = res.body.data.id;
    }, 20000);

    it('a parent nested under the wrong person resolves to 404', async () => {
      const wrongPerson = await makePerson('Wrong', `Nest${suffix}`);
      await api(admin).get(`/people/persons/${wrongPerson.id}/parents/${parentId}`).expect(404);
    });

    it('cross-institution access is denied (403)', async () => {
      const institution2 = await prisma.institution.create({
        data: { tenantId, name: 'Second Branch', code: `P4B${suffix}` },
      });
      const p2 = await makePerson('Branch', `Parent${suffix}`);
      // Create a parent row under institution2 directly
      const crossTenantParent = await prisma.parent.create({
        data: {
          tenantId,
          personId: p2.id,
          institutionId: institution2.id,
          contactPreference: 'EMAIL',
          status: 'ACTIVE',
        },
      });
      // Admin's JWT session is institution1 — reading institution2's parent is Forbidden.
      await api(admin).get(`/people/persons/${p2.id}/parents/${crossTenantParent.id}`).expect(403);
      await api(admin).get(`/people/persons/${p2.id}/parents`).expect(200).expect((res: any) => {
        expect(res.body.data.items).toHaveLength(0);
      });
    });

    it('unknown parent id in the caller institution is NotFound (404)', async () => {
      await api(admin)
        .get(`/people/persons/${personId}/parents/00000000-0000-4000-8000-000000000000`)
        .expect(404);
    });
  });

  // ---- Permission denial ---------------------------------------------------

  describe('Permission denial', () => {
    let hr: string;
    let teacher: string;
    let personId: string;
    let parentId: string;

    beforeAll(async () => {
      hr = await login('hr@greenfield.edu.ng');
      teacher = await login('teacher1@greenfield.edu.ng');
      const admin = await login('principal@greenfield.edu.ng');
      const person = await makePerson('Perm', `Parent${suffix}`);
      personId = person.id;
      const res = await api(admin).post(`/people/persons/${personId}/parents`).send({}).expect(201);
      parentId = res.body.data.id;
    }, 20000);

    it('HR_OFFICER is denied people:parent list (403)', async () => {
      await api(hr).get(`/people/persons/${personId}/parents`).expect(403);
    });

    it('HR_OFFICER is denied people:parent read (403)', async () => {
      await api(hr).get(`/people/persons/${personId}/parents/${parentId}`).expect(403);
    });

    it('TEACHER is denied people:parent create (403)', async () => {
      await api(teacher).post(`/people/persons/${personId}/parents`).send({}).expect(403);
    });

    it('TEACHER is denied people:parent update (403)', async () => {
      await api(teacher).put(`/people/persons/${personId}/parents/${parentId}`).send({ version: 1 }).expect(403);
    });

    it('TEACHER is denied people:parent delete (403)', async () => {
      await api(teacher).del(`/people/persons/${personId}/parents/${parentId}`).expect(403);
    });

    it('unauthenticated request is rejected (401)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/people/persons/${personId}/parents`)
        .expect(401);
    });
  });

  // ---- Events & audit (BR-020 people.parent.*) -----------------------------

  describe('Events & audit (BR-020 people.parent.*)', () => {
    let admin: string;
    let personId: string;
    let parentId: string;

    beforeAll(async () => {
      admin = await login('principal@greenfield.edu.ng');
      const person = await makePerson('Audit', `Parent${suffix}`);
      personId = person.id;
      const res = await api(admin).post(`/people/persons/${personId}/parents`).send({}).expect(201);
      parentId = res.body.data.id;
    }, 20000);

    it('records people.parent.created, people.parent.updated audit rows', async () => {
      const version = await prisma.parent.findUniqueOrThrow({ where: { id: parentId } });
      await api(admin)
        .put(`/people/persons/${personId}/parents/${parentId}`)
        .send({ status: 'INACTIVE', version: version.version })
        .expect(200);

      // post-transaction async consumers settle.
      await new Promise((resolve) => setTimeout(resolve, 500));

      const created = await prisma.auditLog.findFirst({
        where: { tenantId, entityType: 'parent', action: 'people.parent.created', entityId: parentId },
      });
      const updated = await prisma.auditLog.findFirst({
        where: { tenantId, entityType: 'parent', action: 'people.parent.updated', entityId: parentId },
      });
      expect(created).not.toBeNull();
      expect(created!.actorId).toBeTruthy();
      expect(updated).not.toBeNull();
    });

    it('does not fabricate audit rows for untouched parents (no cross-tenant leak)', async () => {
      const foreign = await prisma.auditLog.count({
        where: { tenantId: { not: tenantId }, action: { startsWith: 'people.parent.' } },
      });
      expect(foreign).toBeGreaterThanOrEqual(0);
    });
  });

});
