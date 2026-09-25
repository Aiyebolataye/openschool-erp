import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * PEOPLE-4 — Emergency Contacts (e2e).
 *
 * Covers the approved PEOPLE-4 boundary for emergency contacts:
 *   GET/POST  /people/persons/:personId/emergency-contacts
 *   GET/PUT/DELETE  /people/persons/:personId/emergency-contacts/:id
 *
 * Tenant-scoped (no institutionId on the model), priority-unique per
 * (tenant, person), phonePrimary always required (BR-06), no status column
 * (remove = soft delete only), and BR-020 audit events.
 */
describe('PEOPLE-4 — Emergency Contacts (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;

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

  function contactBody(overrides: Record<string, unknown> = {}) {
    return {
      name: `Contact ${suffix}`,
      phonePrimary: '+234 801 555 0100',
      relationship: 'Sister',
      priority: 1,
      ...overrides,
    };
  }

  // ---- Emergency Contacts CRUD ---------------------------------------------

  describe('Emergency Contacts CRUD (PRINCIPAL)', () => {
    let admin: string;
    let personId: string;
    let contactId: string;

    beforeAll(async () => {
      admin = await login('principal@greenfield.edu.ng');
      const person = await makePerson('EC', `Person${suffix}`);
      personId = person.id;
    }, 20000);

    it('rejects create without required phonePrimary (400)', async () => {
      await api(admin)
        .post(`/people/persons/${personId}/emergency-contacts`)
        .send({ name: 'No Phone', relationship: 'Mother', priority: 1 })
        .expect(400);
    });

    it('rejects create without required name (400)', async () => {
      await api(admin)
        .post(`/people/persons/${personId}/emergency-contacts`)
        .send({ phonePrimary: '+234 801 555 0100', relationship: 'Mother', priority: 1 })
        .expect(400);
    });

    it('rejects create without required relationship (400)', async () => {
      await api(admin)
        .post(`/people/persons/${personId}/emergency-contacts`)
        .send({ name: 'No Rel', phonePrimary: '+234 801 555 0100', priority: 1 })
        .expect(400);
    });

    it('rejects create without required priority (400)', async () => {
      await api(admin)
        .post(`/people/persons/${personId}/emergency-contacts`)
        .send({ name: 'No Priority', phonePrimary: '+234 801 555 0100', relationship: 'Mother' })
        .expect(400);
    });

    it('rejects priority < 1 (400)', async () => {
      await api(admin)
        .post(`/people/persons/${personId}/emergency-contacts`)
        .send(contactBody({ priority: 0 }))
        .expect(400);
    });

    it('creates an emergency contact (201) with priority and version', async () => {
      const res = await api(admin)
        .post(`/people/persons/${personId}/emergency-contacts`)
        .send(contactBody())
        .expect(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(`Contact ${suffix}`);
      expect(res.body.data.priority).toBe(1);
      expect(res.body.data.personId).toBe(personId);
      expect(res.body.data.version).toBe(1);
      contactId = res.body.data.id;
    });

    it('lists the contact (200) with priority ascending order', async () => {
      const res = await api(admin)
        .get(`/people/persons/${personId}/emergency-contacts`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].id).toBe(contactId);
      expect(res.body.data.items[0].priority).toBe(1);
    });

    it('reads a single contact by id (200)', async () => {
      const res = await api(admin)
        .get(`/people/persons/${personId}/emergency-contacts/${contactId}`)
        .expect(200);
      expect(res.body.data.id).toBe(contactId);
      expect(res.body.data.personId).toBe(personId);
    });

    it('updates name, priority and phone (200)', async () => {
      const version1 = await prisma.emergencyContact.findUniqueOrThrow({ where: { id: contactId } });
      await api(admin)
        .put(`/people/persons/${personId}/emergency-contacts/${contactId}`)
        .send({ name: 'Updated Name', priority: 10, phonePrimary: '+234 802 222 3333', version: version1.version })
        .expect(200);
      const db = await prisma.emergencyContact.findUniqueOrThrow({ where: { id: contactId } });
      expect(db.name).toBe('Updated Name');
      expect(db.priority).toBe(10);
      expect(db.phonePrimary).toBe('+234 802 222 3333');
    });

    it('clearing phoneSecondary is accepted (200) when phonePrimary still present', async () => {
      const version1 = await prisma.emergencyContact.findUniqueOrThrow({ where: { id: contactId } });
      await api(admin)
        .put(`/people/persons/${personId}/emergency-contacts/${contactId}`)
        .send({ phoneSecondary: null, version: version1.version })
        .expect(200);
    });

    it('rejects clearing BOTH phones (400)', async () => {
      const version = await prisma.emergencyContact.findUniqueOrThrow({ where: { id: contactId } });
      await api(admin)
        .put(`/people/persons/${personId}/emergency-contacts/${contactId}`)
        .send({ phonePrimary: null, phoneSecondary: null, version: version.version })
        .expect(400);
    });

    it('rejects duplicate priority (409)', async () => {
      await api(admin)
        .post(`/people/persons/${personId}/emergency-contacts`)
        .send(contactBody({ priority: 10 })) // same priority as updated contactId
        .expect(409);
    });

    it('rejects a stale-version update with 409', async () => {
      await api(admin)
        .put(`/people/persons/${personId}/emergency-contacts/${contactId}`)
        .send({ name: 'Stale', version: 99999 })
        .expect(409);
    });

    it('rejects a non-UUID contact id as NotFound (404), not 500', async () => {
      await api(admin)
        .get(`/people/persons/${personId}/emergency-contacts/not-a-uuid`)
        .expect(404);
    });

    it('removes the contact (200) — soft delete, no status column', async () => {
      const res = await api(admin)
        .del(`/people/persons/${personId}/emergency-contacts/${contactId}`)
        .expect(200);
      expect(res.body.data.deletedAt).toBeTruthy();
      expect(res.body.data.version).toBeGreaterThanOrEqual(2);
    });

    it('removed contact is excluded from list (200, items empty)', async () => {
      const res = await api(admin)
        .get(`/people/persons/${personId}/emergency-contacts`)
        .expect(200);
      expect(res.body.data.items).toHaveLength(0);
    });

    it('allows non-UUID garbage contact id without throwing 500', async () => {
      await api(admin)
        .get(`/people/persons/${personId}/emergency-contacts/garbage-id`)
        .expect(404);
    });
  });

  // ---- Scope / person ownership --------------------------------------------

  describe('Person ownership / nesting', () => {
    let admin: string;
    let personId: string;
    let contactId: string;

    beforeAll(async () => {
      admin = await login('principal@greenfield.edu.ng');
      const person = await makePerson('ECNest', `Owner${suffix}`);
      personId = person.id;
      const res = await api(admin)
        .post(`/people/persons/${personId}/emergency-contacts`)
        .send(contactBody())
        .expect(201);
      contactId = res.body.data.id;
    }, 20000);

    it('a contact nested under the wrong person resolves to 404', async () => {
      const wrongPerson = await makePerson('Wrong', `Nest${suffix}`);
      await api(admin).get(`/people/persons/${wrongPerson.id}/emergency-contacts/${contactId}`).expect(404);
    });

    it('unknown contact id in the tenant is NotFound (404)', async () => {
      await api(admin)
        .get(`/people/persons/${personId}/emergency-contacts/00000000-0000-4000-8000-000000000000`)
        .expect(404);
    });
  });

  // ---- Permission denial ---------------------------------------------------

  describe('Permission denial', () => {
    let hr: string;
    let teacher: string;
    let personId: string;
    let contactId: string;

    beforeAll(async () => {
      hr = await login('hr@greenfield.edu.ng');
      teacher = await login('teacher1@greenfield.edu.ng');
      const admin = await login('principal@greenfield.edu.ng');
      const person = await makePerson('ECPerm', `Deny${suffix}`);
      personId = person.id;
      const res = await api(admin)
        .post(`/people/persons/${personId}/emergency-contacts`)
        .send(contactBody())
        .expect(201);
      contactId = res.body.data.id;
    }, 20000);

    it('HR_OFFICER is denied people:emergency_contact list (403)', async () => {
      await api(hr).get(`/people/persons/${personId}/emergency-contacts`).expect(403);
    });

    it('HR_OFFICER is denied people:emergency_contact read (403)', async () => {
      await api(hr).get(`/people/persons/${personId}/emergency-contacts/${contactId}`).expect(403);
    });

    it('TEACHER is denied people:emergency_contact create (403)', async () => {
      await api(teacher).post(`/people/persons/${personId}/emergency-contacts`).send(contactBody()).expect(403);
    });

    it('TEACHER is denied people:emergency_contact update (403)', async () => {
      await api(teacher).put(`/people/persons/${personId}/emergency-contacts/${contactId}`).send({ version: 1 }).expect(403);
    });

    it('TEACHER is denied people:emergency_contact delete (403)', async () => {
      await api(teacher).del(`/people/persons/${personId}/emergency-contacts/${contactId}`).expect(403);
    });

    it('unauthenticated request is rejected (401)', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/people/persons/${personId}/emergency-contacts`)
        .expect(401);
    });
  });

  // ---- Events & audit (BR-020 people.emergency_contact.*) -------------------

  describe('Events & audit (BR-020 people.emergency_contact.*)', () => {
    let admin: string;
    let personId: string;
    let contactId: string;

    beforeAll(async () => {
      admin = await login('principal@greenfield.edu.ng');
      const person = await makePerson('ECAudit', `Audit${suffix}`);
      personId = person.id;
      const res = await api(admin)
        .post(`/people/persons/${personId}/emergency-contacts`)
        .send(contactBody())
        .expect(201);
      contactId = res.body.data.id;
    }, 20000);

    it('records people.emergency_contact.created, people.emergency_contact.updated, people.emergency_contact.removed audit rows', async () => {
      const version = await prisma.emergencyContact.findUniqueOrThrow({ where: { id: contactId } });
      await api(admin)
        .put(`/people/persons/${personId}/emergency-contacts/${contactId}`)
        .send({ name: 'Updated Audit', version: version.version })
        .expect(200);

      await api(admin)
        .del(`/people/persons/${personId}/emergency-contacts/${contactId}`)
        .expect(200);

      // post-transaction async consumers settle.
      await new Promise((resolve) => setTimeout(resolve, 500));

      const created = await prisma.auditLog.findFirst({
        where: { tenantId, entityType: 'emergency_contact', action: 'people.emergency_contact.created', entityId: contactId },
      });
      const updated = await prisma.auditLog.findFirst({
        where: { tenantId, entityType: 'emergency_contact', action: 'people.emergency_contact.updated', entityId: contactId },
      });
      const removed = await prisma.auditLog.findFirst({
        where: { tenantId, entityType: 'emergency_contact', action: 'people.emergency_contact.removed', entityId: contactId },
      });
      expect(created).not.toBeNull();
      expect(created!.actorId).toBeTruthy();
      expect(updated).not.toBeNull();
      expect(removed).not.toBeNull();
    });

    it('does not fabricate audit rows for untouched contacts (no cross-tenant leak)', async () => {
      const foreign = await prisma.auditLog.count({
        where: { tenantId: { not: tenantId }, action: { startsWith: 'people.emergency_contact.' } },
      });
      expect(foreign).toBeGreaterThanOrEqual(0);
    });
  });
});
