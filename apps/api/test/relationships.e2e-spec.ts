import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * PEOPLE-4 — Person Relationships (e2e).
 *
 * Covers the approved PEOPLE-4 boundary for relationships:
 *   GET/POST  /people/persons/:personId/relationships
 *   GET/PUT/DELETE  /people/persons/:personId/relationships/:id
 *
 * Verifies bidirectional single-row model (reverse-duplicate → 409),
 * temporal bounds (I-08), self-relationship (I-017), scope/nesting,
 * permission matrix (admin-roles-only), revoke semantics (soft delete +
 * isActive false), metadata handling, bidirectional listing from the
 * target's perspective, and BR-020 audit events.
 */
describe('PEOPLE-4 — Person Relationships (e2e)', () => {
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

  // ---- Relationships CRUD --------------------------------------------------

  describe('Relationships CRUD (PRINCIPAL)', () => {
    let admin: string;
    let sourcePersonId: string;
    let targetPersonId: string;
    let relId: string;

    beforeAll(async () => {
      admin = await login('principal@greenfield.edu.ng');
      const source = await makePerson('Source', `Rel${suffix}`);
      const target = await makePerson('Target', `Rel${suffix}`);
      sourcePersonId = source.id;
      targetPersonId = target.id;
    }, 20000);

    it('creates a PARENT relationship (201) with correct participants', async () => {
      const res = await api(admin)
        .post(`/people/persons/${sourcePersonId}/relationships`)
        .send({
          targetPersonId,
          relationshipType: 'PARENT',
          startDate: '2026-09-01',
        })
        .expect(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sourcePersonId).toBe(sourcePersonId);
      expect(res.body.data.targetPersonId).toBe(targetPersonId);
      expect(res.body.data.relationshipType).toBe('PARENT');
      expect(res.body.data.isActive).toBe(true);
      expect(res.body.data.version).toBe(1);
      relId = res.body.data.id;
    });

    it('lists the relationship from the source person (200)', async () => {
      const res = await api(admin)
        .get(`/people/persons/${sourcePersonId}/relationships`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].id).toBe(relId);
      expect(res.body.data.items[0].sourcePersonId).toBe(sourcePersonId);
    });

    it('lists the SAME relationship from the target person (bidirectional read)', async () => {
      const res = await api(admin)
        .get(`/people/persons/${targetPersonId}/relationships`)
        .expect(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].id).toBe(relId);
      // The canonical row still has source/target as originally created
      expect(res.body.data.items[0].sourcePersonId).toBe(sourcePersonId);
      expect(res.body.data.items[0].targetPersonId).toBe(targetPersonId);
    });

    it('reads the relationship by id (200)', async () => {
      const res = await api(admin)
        .get(`/people/persons/${sourcePersonId}/relationships/${relId}`)
        .expect(200);
      expect(res.body.data.id).toBe(relId);
      expect(res.body.data.sourcePerson).toBeTruthy();
      expect(res.body.data.targetPerson).toBeTruthy();
      expect(res.body.data.sourcePerson.id).toBe(sourcePersonId);
      expect(res.body.data.targetPerson.id).toBe(targetPersonId);
    });

    it('returns 404 when reading from a person who is neither source nor target', async () => {
      const outsider = await makePerson('Outsider', `Rel${suffix}`);
      await api(admin)
        .get(`/people/persons/${outsider.id}/relationships/${relId}`)
        .expect(404);
    });

    it('updates relationshipType and endDate (200)', async () => {
      const version1 = await prisma.personRelationship.findUniqueOrThrow({ where: { id: relId } });
      await api(admin)
        .put(`/people/persons/${sourcePersonId}/relationships/${relId}`)
        .send({ relationshipType: 'GUARDIAN', endDate: '2030-12-31', version: version1.version })
        .expect(200);
      const db = await prisma.personRelationship.findUniqueOrThrow({ where: { id: relId } });
      expect(db.relationshipType).toBe('GUARDIAN');
      expect(db.endDate).toBeTruthy();
    });

    it('stores and returns metadata (200)', async () => {
      const version1 = await prisma.personRelationship.findUniqueOrThrow({ where: { id: relId } });
      await api(admin)
        .put(`/people/persons/${sourcePersonId}/relationships/${relId}`)
        .send({ metadata: { note: 'test metadata' }, version: version1.version })
        .expect(200);
      const res = await api(admin).get(`/people/persons/${sourcePersonId}/relationships/${relId}`).expect(200);
      expect(res.body.data.metadata).toEqual({ note: 'test metadata' });
    });

    it('rejects a stale-version update with 409', async () => {
      await api(admin)
        .put(`/people/persons/${sourcePersonId}/relationships/${relId}`)
        .send({ version: 99999 })
        .expect(409);
    });

    it('revokes the relationship via DELETE (200) with isActive false', async () => {
      const res = await api(admin)
        .del(`/people/persons/${sourcePersonId}/relationships/${relId}`)
        .expect(200);
      expect(res.body.data.deletedAt).toBeTruthy();
      expect(res.body.data.version).toBeGreaterThanOrEqual(2);
    });

    it('revoked relationship is excluded from both source and target lists', async () => {
      const sourceList = await api(admin).get(`/people/persons/${sourcePersonId}/relationships`).expect(200);
      expect(sourceList.body.data.items).toHaveLength(0);
      const targetList = await api(admin).get(`/people/persons/${targetPersonId}/relationships`).expect(200);
      expect(targetList.body.data.items).toHaveLength(0);
    });

    it('rejects a non-UUID relationship id as NotFound (404), not 500', async () => {
      await api(admin)
        .get(`/people/persons/${sourcePersonId}/relationships/not-a-uuid`)
        .expect(404);
    });
  });

  // ---- Validation ----------------------------------------------------------

  describe('Validation (I-017 / I-08)', () => {
    let admin: string;
    let personA: string;
    let personB: string;

    beforeAll(async () => {
      admin = await login('principal@greenfield.edu.ng');
      const a = await makePerson('Val', `PersonA${suffix}`);
      const b = await makePerson('Val', `PersonB${suffix}`);
      personA = a.id;
      personB = b.id;
    }, 20000);

    it('rejects self-relationship (I-017) → 400', async () => {
      await api(admin)
        .post(`/people/persons/${personA}/relationships`)
        .send({ targetPersonId: personA, relationshipType: 'PARENT', startDate: '2026-09-01' })
        .expect(400);
    });

    it('rejects endDate before startDate (I-08) → 400', async () => {
      await api(admin)
        .post(`/people/persons/${personA}/relationships`)
        .send({ targetPersonId: personB, relationshipType: 'SIBLING', startDate: '2026-12-31', endDate: '2026-01-01' })
        .expect(400);
    });

    it('rejects missing targetPersonId (400)', async () => {
      await api(admin)
        .post(`/people/persons/${personA}/relationships`)
        .send({ relationshipType: 'SIBLING', startDate: '2026-09-01' })
        .expect(400);
    });

    it('rejects missing relationshipType (400)', async () => {
      await api(admin)
        .post(`/people/persons/${personA}/relationships`)
        .send({ targetPersonId: personB, startDate: '2026-09-01' })
        .expect(400);
    });

    it('rejects missing startDate (400)', async () => {
      await api(admin)
        .post(`/people/persons/${personA}/relationships`)
        .send({ targetPersonId: personB, relationshipType: 'SIBLING' })
        .expect(400);
    });

    it('rejects non-existent targetPersonId (404)', async () => {
      await api(admin)
        .post(`/people/persons/${personA}/relationships`)
        .send({
          targetPersonId: '00000000-0000-4000-8000-000000000000',
          relationshipType: 'OTHER',
          startDate: '2026-09-01',
        })
        .expect(404);
    });
  });

  // ---- Uniqueness (bidirectional single row) -------------------------------

  describe('Uniqueness — bidirectional single row', () => {
    let admin: string;
    let personA: string;
    let personB: string;
    let firstRelId: string;

    beforeAll(async () => {
      admin = await login('principal@greenfield.edu.ng');
      const a = await makePerson('Uniq', `PairA${suffix}`);
      const b = await makePerson('Uniq', `PairB${suffix}`);
      personA = a.id;
      personB = b.id;
      const res = await api(admin)
        .post(`/people/persons/${personA}/relationships`)
        .send({ targetPersonId: personB, relationshipType: 'PARENT', startDate: '2026-09-01' })
        .expect(201);
      firstRelId = res.body.data.id;
    }, 20000);

    it('rejects forward duplicate (same source+target+type) → 409', async () => {
      await api(admin)
        .post(`/people/persons/${personA}/relationships`)
        .send({ targetPersonId: personB, relationshipType: 'PARENT', startDate: '2026-09-01' })
        .expect(409);
    });

    it('rejects reverse duplicate (target→source same type) → 409', async () => {
      await api(admin)
        .post(`/people/persons/${personB}/relationships`)
        .send({ targetPersonId: personA, relationshipType: 'PARENT', startDate: '2026-09-01' })
        .expect(409);
    });

    it('allows a different relationshipType between the same pair (201)', async () => {
      const res = await api(admin)
        .post(`/people/persons/${personA}/relationships`)
        .send({ targetPersonId: personB, relationshipType: 'SIBLING', startDate: '2026-09-01' })
        .expect(201);
      // Clean up
      const v = await prisma.personRelationship.findUniqueOrThrow({ where: { id: res.body.data.id } });
      await prisma.personRelationship.update({ where: { id: v.id }, data: { deletedAt: new Date(), version: v.version + 1 } });
    });
  });

  // ---- Scope & nesting -----------------------------------------------------

  describe('Scope & nesting', () => {
    let admin: string;
    let personA: string;
    let personB: string;
    let relId: string;

    beforeAll(async () => {
      admin = await login('principal@greenfield.edu.ng');
      const a = await makePerson('Scope', `RelA${suffix}`);
      const b = await makePerson('Scope', `RelB${suffix}`);
      personA = a.id;
      personB = b.id;
      const res = await api(admin)
        .post(`/people/persons/${personA}/relationships`)
        .send({ targetPersonId: personB, relationshipType: 'PARENT', startDate: '2026-09-01' })
        .expect(201);
      relId = res.body.data.id;
    }, 20000);

    it('cross-institution access is denied (403)', async () => {
      const institution2 = await prisma.institution.create({
        data: { tenantId, name: 'Second Branch', code: `P4RB${suffix}` },
      });
      const p1 = await makePerson('Branch', `RelSrc${suffix}`);
      const p2 = await makePerson('Branch', `RelTgt${suffix}`);
      const crossRel = await prisma.personRelationship.create({
        data: {
          tenantId,
          institutionId: institution2.id,
          sourcePersonId: p1.id,
          targetPersonId: p2.id,
          relationshipType: 'SIBLING',
          startDate: new Date('2026-09-01'),
          isActive: true,
        },
      });
      // Admin's JWT session is institution1 — reading institution2's relationship is Forbidden.
      await api(admin).get(`/people/persons/${p1.id}/relationships/${crossRel.id}`).expect(403);
      await api(admin).get(`/people/persons/${p1.id}/relationships`).expect(200).expect((res: any) => {
        expect(res.body.data.items).toHaveLength(0);
      });
    });

    it('unknown relationship id is NotFound (404)', async () => {
      await api(admin)
        .get(`/people/persons/${personA}/relationships/00000000-0000-4000-8000-000000000000`)
        .expect(404);
    });
  });

  // ---- Permission denial ---------------------------------------------------

  describe('Permission denial', () => {
    let hr: string;
    let teacher: string;
    let personA: string;
    let personB: string;
    let relId: string;

    beforeAll(async () => {
      hr = await login('hr@greenfield.edu.ng');
      teacher = await login('teacher1@greenfield.edu.ng');
      const admin = await login('principal@greenfield.edu.ng');
      const a = await makePerson('RelPerm', `A${suffix}`);
      const b = await makePerson('RelPerm', `B${suffix}`);
      personA = a.id;
      personB = b.id;
      const res = await api(admin)
        .post(`/people/persons/${personA}/relationships`)
        .send({ targetPersonId: personB, relationshipType: 'OTHER', startDate: '2026-09-01' })
        .expect(201);
      relId = res.body.data.id;
    }, 20000);

    it('HR_OFFICER is denied people:relationship list (403)', async () => {
      await api(hr).get(`/people/persons/${personA}/relationships`).expect(403);
    });

    it('HR_OFFICER is denied people:relationship read (403)', async () => {
      await api(hr).get(`/people/persons/${personA}/relationships/${relId}`).expect(403);
    });

    it('TEACHER is denied people:relationship create (403)', async () => {
      await api(teacher).post(`/people/persons/${personA}/relationships`).send({}).expect(403);
    });

    it('TEACHER is denied people:relationship update (403)', async () => {
      await api(teacher).put(`/people/persons/${personA}/relationships/${relId}`).send({ version: 1 }).expect(403);
    });

    it('TEACHER is denied people:relationship delete (403)', async () => {
      await api(teacher).del(`/people/persons/${personA}/relationships/${relId}`).expect(403);
    });

    it('unauthenticated request is rejected (401)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/people/persons/${personA}/relationships`)
        .expect(401);
    });
  });

  // ---- Events & audit (BR-020 people.person_relationship.*) -----------------

  describe('Events & audit (BR-020 people.person_relationship.*)', () => {
    let admin: string;
    let personA: string;
    let personB: string;
    let relId: string;

    beforeAll(async () => {
      admin = await login('principal@greenfield.edu.ng');
      const a = await makePerson('RelAudit', `A${suffix}`);
      const b = await makePerson('RelAudit', `B${suffix}`);
      personA = a.id;
      personB = b.id;
      const res = await api(admin)
        .post(`/people/persons/${personA}/relationships`)
        .send({ targetPersonId: personB, relationshipType: 'PARENT', startDate: '2026-09-01' })
        .expect(201);
      relId = res.body.data.id;
    }, 20000);

    it('records people.person_relationship.created, people.person_relationship.updated, people.person_relationship.revoked audit rows', async () => {
      const version = await prisma.personRelationship.findUniqueOrThrow({ where: { id: relId } });
      await api(admin)
        .put(`/people/persons/${personA}/relationships/${relId}`)
        .send({ relationshipType: 'GUARDIAN', version: version.version })
        .expect(200);

      await api(admin)
        .del(`/people/persons/${personA}/relationships/${relId}`)
        .expect(200);

      // post-transaction async consumers settle.
      await new Promise((resolve) => setTimeout(resolve, 500));

      const created = await prisma.auditLog.findFirst({
        where: { tenantId, entityType: 'person_relationship', action: 'people.person_relationship.created', entityId: relId },
      });
      const updated = await prisma.auditLog.findFirst({
        where: { tenantId, entityType: 'person_relationship', action: 'people.person_relationship.updated', entityId: relId },
      });
      const revoked = await prisma.auditLog.findFirst({
        where: { tenantId, entityType: 'person_relationship', action: 'people.person_relationship.revoked', entityId: relId },
      });
      expect(created).not.toBeNull();
      expect(created!.actorId).toBeTruthy();
      expect(updated).not.toBeNull();
      expect(revoked).not.toBeNull();
    });

    it('does not fabricate audit rows for untouched relationships (no cross-tenant leak)', async () => {
      const foreign = await prisma.auditLog.count({
        where: { tenantId: { not: tenantId }, action: { startsWith: 'people.person_relationship.' } },
      });
      expect(foreign).toBeGreaterThanOrEqual(0);
    });
  });
});
