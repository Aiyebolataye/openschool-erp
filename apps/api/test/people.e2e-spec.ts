import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import bcrypt from 'bcrypt';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * PEOPLE-2 — Person CRUD/flows + Student lifecycle + object-scope/authz (e2e).
 *
 * Covers: person create/update/search/profile/institutions/soft-delete/restore
 * with version/409 (ADR-014), D-F frozen-field validation, student
 * enrollment → graduation/transfer/withdrawal lifecycle + enrollment-detail
 * immutability after terminal states, people:person/student permission matrix
 * (D-B), PeopleScopeGuard tenant/self scope, and cross-tenant isolation.
 */
describe('PEOPLE-2 — People & Student Management (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  let institutionId: string;

  const suffix = Date.now();
  const uniqueEmail = (label: string) => `${label}.${suffix}@greenfield.edu.ng`;

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

  async function createIsolatedTenant(label: string) {
    const slug = `people2-${label}-${suffix}`;
    const tenant = await prisma.tenant.create({
      data: { name: `PEOPLE2 ${label}`, slug, subdomain: slug },
    });
    const institution = await prisma.institution.create({
      data: { tenantId: tenant.id, name: `${label} Institution`, code: `P2${label.toUpperCase()}` },
    });
    const passwordHash = await bcrypt.hash('Password@123', 10);
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email: `iso.${label}.${suffix}@${slug}.edu.ng`,
        passwordHash,
        firstName: 'Iso',
        lastName: label,
        status: 'ACTIVE',
        emailVerifiedAt: new Date(),
        roles: {
          create: {
            tenantId: tenant.id,
            roleId: (await prisma.role.findUniqueOrThrow({ where: { name: 'INSTITUTION_ADMIN' } })).id,
          },
        },
      },
    });
    await prisma.organizationMembership.create({ data: { tenantId: tenant.id, userId: user.id, status: 'ACTIVE' } });
    await prisma.institutionMembership.create({ data: { tenantId: tenant.id, institutionId: institution.id, userId: user.id, status: 'ACTIVE' } });
    return { tenant, institution, user, slug };
  }

  describe('Person CRUD, profile, institutions, soft-delete (principal)', () => {
    let principal: string;
    let admin: string;
    let createdPersonId: string;
    let publicId: string;

    beforeAll(async () => {
      principal = await login('principal@greenfield.edu.ng');
      admin = await login('admin@greenfield.edu.ng');
    }, 20000);

    it('creates a person (201, envelope, publicId, normalized email, version 1)', async () => {
      const res = await api(principal)
        .post('/people/persons')
        .send({
          firstName: 'Yemi',
          lastName: 'Adebayo',
          email: uniqueEmail('Yemi.Adebayo'),
          phone: '+234 803 555 0100',
          dateOfBirth: '2005-04-12',
          gender: 'MALE',
          bloodGroup: 'O+',
          stateOfOrigin: 'Oyo',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      const person = res.body.data;
      expect(person.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(person.publicId).toMatch(/^P-\d{4}-\d{6}$/);
      expect(person.email).toBe(uniqueEmail('Yemi.Adebayo').toLowerCase());
      expect(person.dateOfBirth).toBe('2005-04-12T00:00:00.000Z');
      expect(person.version).toBe(1);
      expect(person.isActive).toBe(true);
      createdPersonId = person.id;
      publicId = person.publicId;
    });

    it('reads a person by UUID and by publicId', async () => {
      const byId = await api(principal).get(`/people/persons/${createdPersonId}`).expect(200);
      expect(byId.body.data.publicId).toBe(publicId);
      const byPublic = await api(principal).get(`/people/persons/${publicId}`).expect(200);
      expect(byPublic.body.data.id).toBe(createdPersonId);
    });

    it('rejects a duplicate email with 409 CONFLICT and invalid date of birth / missing gender with 400', async () => {
      await api(principal)
        .post('/people/persons')
        .send({
          firstName: 'Yemi',
          lastName: 'Adebayo',
          email: uniqueEmail('Yemi.Adebayo'),
          dateOfBirth: '2005-04-12',
          gender: 'MALE',
        })
        .expect(409)
        .expect((res) => expect(res.body.error.code).toBe('CONFLICT'));

      await api(principal)
        .post('/people/persons')
        .send({
          firstName: 'Future',
          lastName: 'Kid',
          email: uniqueEmail('future.kid'),
          dateOfBirth: '2030-01-01',
          gender: 'MALE',
        })
        .expect(400)
        .expect((res) => expect(res.body.error.code).toBe('BAD_REQUEST'));

      await api(principal)
        .post('/people/persons')
        .send({
          firstName: 'No',
          lastName: 'Gender',
          email: uniqueEmail('no.gender'),
          dateOfBirth: '2005-01-01',
        })
        .expect(400)
        .expect((res) => expect(res.body.error.code).toBe('BAD_REQUEST'));
    });

    it('updates a person with optimistic concurrency (version bump, stale version → 409)', async () => {
      const updated = await api(principal)
        .patch(`/people/persons/${createdPersonId}`)
        .send({ phone: '+234 803 555 0199', version: 1 })
        .expect(200);
      expect(updated.body.data.phone).toBe('+234 803 555 0199');
      expect(updated.body.data.version).toBe(2);

      await api(principal)
        .patch(`/people/persons/${createdPersonId}`)
        .send({ firstName: 'Yemi James', version: 1 })
        .expect(409)
        .expect((res) => expect(res.body.error.code).toBe('CONFLICT'));
    });

    it('updates and reads the person profile', async () => {
      const updated = await api(principal)
        .put(`/people/persons/${createdPersonId}/profile`)
        .send({ bio: 'Broadcast & media tutor', customFields: { house: 'Lagoon' }, metadata: { source: 'e2e' } })
        .expect(200);
      expect(updated.body.data.bio).toBe('Broadcast & media tutor');
      expect(updated.body.data.customFields).toEqual({ house: 'Lagoon' });

      const read = await api(principal).get(`/people/persons/${createdPersonId}/profile`).expect(200);
      expect(read.body.data.bio).toBe('Broadcast & media tutor');
    });

    it('assigns and removes an institution context (roleContext enum validated)', async () => {
      const assigned = await api(principal)
        .post(`/people/persons/${createdPersonId}/institutions`)
        .send({ institutionId, roleContext: 'PARENT' })
        .expect(201);
      expect(assigned.body.data.roleContext).toBe('PARENT');

      const list = await api(principal).get(`/people/persons/${createdPersonId}/institutions`).expect(200);
      expect(list.body.data.total).toBe(1);
      expect(list.body.data.items[0].institution.id).toBe(institutionId);

      await api(principal)
        .post(`/people/persons/${createdPersonId}/institutions`)
        .send({ institutionId, roleContext: 'PARENT' })
        .expect(409);

      await api(principal)
        .del(`/people/persons/${createdPersonId}/institutions/${institutionId}`)
        .expect(200);

      const removed = await api(principal).get(`/people/persons/${createdPersonId}/institutions`).expect(200);
      expect(removed.body.data.total).toBe(0);
    });

    it('soft-deletes (excludes from reads) and restores', async () => {
      const removed = await api(principal).del(`/people/persons/${createdPersonId}`).expect(200);
      expect(removed.body.data.isActive).toBe(false);

      await api(principal).get(`/people/persons/${createdPersonId}`).expect(404);

      const restored = await api(principal).post(`/people/persons/${createdPersonId}/restore`).expect(201);
      expect(restored.body.data.isActive).toBe(true);

      await api(principal).get(`/people/persons/${createdPersonId}`).expect(200);
    });

    it('searches people (fuzzy by name and exact by email) with deterministic pagination', async () => {
      const fuzzy = await api(principal)
        .get('/people/persons/search?search=adebayo&searchMode=fuzzy')
        .expect(200);
      expect(fuzzy.body.data.total).toBe(1);
      expect(fuzzy.body.data.items[0].id).toBe(createdPersonId);

      const exact = await api(principal)
        .get(`/people/persons/search?search=${encodeURIComponent(uniqueEmail('Yemi.Adebayo').toLowerCase())}&searchMode=exact`)
        .expect(200);
      expect(exact.body.data.total).toBe(1);

      const byPublicId = await api(principal)
        .get(`/people/persons/search?search=${publicId}&searchMode=exact`)
        .expect(200);
      expect(byPublicId.body.data.total).toBe(1);

      const page = await api(principal).get(`/people/persons?page=${1}&limit=${100}`).expect(200);
      expect(page.body.data.page).toBe(1);
      expect(page.body.data.limit).toBe(100);
    });

    it('admin (no institution context) cannot create student records (403)', async () => {
      await api(admin)
        .post('/people/persons/00000000-0000-0000-0000-000000000000/students')
        .send({ gradeLevel: 'SS1', enrollmentType: 'NEW' })
        .expect(403)
        .expect((res) => expect(res.body.error.code).toBe('FORBIDDEN'));
    });
  });

  describe('Student lifecycle (student-mgmt, institution-scoped)', () => {
    let studentMgmt: string;
    let p1: string;
    let p2: string;
    let p3: string;
    let s1: string;

    async function makePerson(email: string) {
      const principal = await login('principal@greenfield.edu.ng');
      const res = await api(principal)
        .post('/people/persons')
        .send({
          firstName: 'Student',
          lastName: `Case${suffix}`,
          email,
          dateOfBirth: '2007-02-14',
          gender: 'FEMALE',
        })
        .expect(201);
      return res.body.data.id;
    }

    beforeAll(async () => {
      studentMgmt = await login('student-mgmt@greenfield.edu.ng');
      p1 = await makePerson(uniqueEmail('student.case.one'));
      p2 = await makePerson(uniqueEmail('student.case.two'));
      p3 = await makePerson(uniqueEmail('student.case.three'));
    }, 30000);

    it('enrolls a student (creates Student + EnrollmentDetail + STUDENT PersonInstitution, internal email)', async () => {
      const res = await api(studentMgmt)
        .post(`/people/persons/${p1}/students`)
        .send({
          studentNumber: `P2S1${suffix}`,
          gradeLevel: 'SS1',
          className: 'SS 1 Science',
          stream: 'A',
          enrollmentType: 'NEW',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      const student = res.body.data;
      expect(student.publicId).toMatch(/^STU-\d{4}-\d{6}$/);
      expect(student.status).toBe('ENROLLED');
      expect(student.internalEmail).toMatch(/\.local$/);
      expect(student.enrollmentDetail.enrollmentType).toBe('NEW');
      expect(student.enrollmentDetail.gradeLevel).toBe('SS1');
      expect(student.version).toBe(1);
      s1 = student.id;

      const pi = await prisma.personInstitution.findFirst({
        where: { tenantId, personId: p1, institutionId, roleContext: 'STUDENT', deletedAt: null },
      });
      expect(pi).not.toBeNull();
    });

    it('rejects duplicate enrollment for the same person+institution (409)', async () => {
      await api(studentMgmt)
        .post(`/people/persons/${p1}/students`)
        .send({ gradeLevel: 'SS1', enrollmentType: 'NEW' })
        .expect(409)
        .expect((res) => expect(res.body.error.code).toBe('CONFLICT'));
    });

    it('lists and reads students under the parent route with status filter', async () => {
      const list = await api(studentMgmt)
        .get(`/people/persons/${p1}/students?status=ENROLLED`)
        .expect(200);
      expect(list.body.data.total).toBe(1);
      expect(list.body.data.items[0].id).toBe(s1);

      const read = await api(studentMgmt).get(`/people/persons/${p1}/students/${s1}`).expect(200);
      expect(read.body.data.id).toBe(s1);
      expect(read.body.data.personId).toBe(p1);
    });

    it('updates enrollment detail (version-driven) and activates the student', async () => {
      const enrollment = await api(studentMgmt)
        .put(`/people/persons/${p1}/students/${s1}/enrollment`)
        .send({ gradeLevel: 'SS2', className: 'SS 2 Science', enrollmentType: 'PROMOTED', version: 1 })
        .expect(200);
      expect(enrollment.body.data.gradeLevel).toBe('SS2');
      expect(enrollment.body.data.version).toBe(2);

      const activated = await api(studentMgmt)
        .patch(`/people/persons/${p1}/students/${s1}`)
        .send({ status: 'ACTIVE', version: 2 })
        .expect(200);
      expect(activated.body.data.status).toBe('ACTIVE');
      expect(activated.body.data.version).toBe(3);
    });

    it('graduates an active student; enrollment detail becomes immutable (409)', async () => {
      const graduation = await api(studentMgmt)
        .put(`/people/persons/${p1}/students/${s1}/graduation`)
        .send({ graduationDate: '2027-07-31', finalGrade: 'B', version: 3 })
        .expect(200);
      expect(graduation.body.data.status).toBe('GRADUATED');

      const immutable = await api(studentMgmt)
        .put(`/people/persons/${p1}/students/${s1}/enrollment`)
        .send({ gradeLevel: 'SS3', version: 4 })
        .expect(409)
        .expect((res) => expect(res.body.error.code).toBe('CONFLICT'));

      const illegalActivation = await api(studentMgmt)
        .patch(`/people/persons/${p1}/students/${s1}`)
        .send({ status: 'ACTIVE', version: 4 })
        .expect(409);
      expect(illegalActivation.body.error.code).toBe('CONFLICT');

      await api(studentMgmt)
        .patch(`/people/persons/${p1}/students/${s1}`)
        .send({ status: 'WITHDRAWN', version: 4 })
        .expect(409);
    });

    it('transfers and withdraws sibling students via their dedicated endpoints', async () => {
      const s2 = (
        await api(studentMgmt)
          .post(`/people/persons/${p2}/students`)
          .send({ gradeLevel: 'SS1', enrollmentType: 'TRANSFER' })
          .expect(201)
      ).body.data.id;

      const transfer = await api(studentMgmt)
        .put(`/people/persons/${p2}/students/${s2}/transfer`)
        .send({ transferDate: '2027-09-01', transferReason: 'Family relocation', version: 1 })
        .expect(200);
      expect(transfer.body.data.status).toBe('TRANSFERRED');
      expect(transfer.body.data.transferDetail.sourceInstitutionId).toBe(institutionId);

      const s3 = (
        await api(studentMgmt)
          .post(`/people/persons/${p3}/students`)
          .send({ gradeLevel: 'SS1', enrollmentType: 'NEW' })
          .expect(201)
      ).body.data.id;

      const withdrawal = await api(studentMgmt)
        .put(`/people/persons/${p3}/students/${s3}/withdrawal`)
        .send({ withdrawalDate: '2027-06-30', withdrawalType: 'VOLUNTARY', version: 1 })
        .expect(200);
      expect(withdrawal.body.data.status).toBe('WITHDRAWN');
      expect(withdrawal.body.data.withdrawalDetail.refundStatus).toBe('PENDING');
    });

    it('enforces student version conflicts (409)', async () => {
      await api(studentMgmt)
        .patch(`/people/persons/${p1}/students/${s1}`)
        .send({ studentNumber: 'P2S1-X', version: 999 })
        .expect(409)
        .expect((res) => expect(res.body.error.code).toBe('CONFLICT'));
    });

    it('records people audit events post-transaction (BR-020)', async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const created = await prisma.auditLog.count({
        where: { tenantId, action: 'people.person.created' },
      });
      const enrolled = await prisma.auditLog.count({
        where: { tenantId, action: 'people.student.enrolled' },
      });
      expect(created).toBeGreaterThan(0);
      expect(enrolled).toBe(3);
    });
  });

  describe('Authz & object scope (D-B matrix, PeopleScopeGuard, isolation)', () => {
    let principal: string;
    let teacher: string;
    let parent: string;
    let studentMgmt: string;
    let personId: string;
    let unrelatedStudentId: string;
    let ownStudentId: string;
    let childPersonId: string;
    let ownGuardianPersonId: string;

    beforeAll(async () => {
      principal = await login('principal@greenfield.edu.ng');
      teacher = await login('teacher1@greenfield.edu.ng');
      parent = await login('parent@greenfield.edu.ng');
      studentMgmt = await login('student-mgmt@greenfield.edu.ng');

      const created = await api(principal)
        .post('/people/persons')
        .send({
          firstName: 'Scope',
          lastName: `Target${suffix}`,
          email: uniqueEmail('scope.target'),
          dateOfBirth: '2006-09-01',
          gender: 'MALE',
        })
        .expect(201);
      personId = created.body.data.id;

      const ownStudent = await prisma.student.findFirstOrThrow({
        where: { tenantId, studentNumber: 'STU-21401' },
      });
      ownStudentId = ownStudent.id;
      childPersonId = ownStudent.personId;
      unrelatedStudentId = (await prisma.student.findFirstOrThrow({
        where: { tenantId, studentNumber: 'STU-21402' },
      })).id;
      ownGuardianPersonId = (
        await prisma.guardian.findFirstOrThrow({
          where: {
            tenantId,
            userId: (
              await prisma.user.findFirstOrThrow({
                where: { tenantId, email: 'parent@greenfield.edu.ng' },
                select: { id: true },
              })
            ).id,
          },
        })
      ).personId;
    }, 40000);

    it('teacher: read-only person+student access, writes forbidden (403)', async () => {
      await api(teacher).get(`/people/persons/${personId}`).expect(200);
      await api(teacher)
        .patch(`/people/persons/${personId}`)
        .send({ phone: '+234 800 000 0000', version: 1 })
        .expect(403);

      await api(teacher)
        .post(`/people/persons/${personId}/students`)
        .send({ gradeLevel: 'SS1', enrollmentType: 'NEW' })
        .expect(403);
    });

    it('nested route mismatch returns 404 (student belongs to a different parent person)', async () => {
      await api(studentMgmt)
        .post(`/people/persons/${personId}/students`)
        .send({ gradeLevel: 'SS1', enrollmentType: 'NEW' })
        .expect(201);

      const enrolled = (
        await api(studentMgmt).get(`/people/persons/${personId}/students`).expect(200)
      ).body.data.items[0];

      const mismatched = await api(studentMgmt)
        .get(`/people/persons/00000000-0000-0000-0000-000000000000/students/${enrolled.id}`)
        .expect(404);
      expect(mismatched.body.error.code).toBe('NOT_FOUND');
    });

    it('parent: self-scoped read of own student/person; own-list and writes forbidden (frozen matrix)', async () => {
      await api(parent).get(`/people/persons/${ownGuardianPersonId}`).expect(200);

      await api(parent).get(`/people/persons/${childPersonId}/students/${ownStudentId}`).expect(200);

      const ownList = await api(parent)
        .get(`/people/persons/${childPersonId}/students?status=ENROLLED`)
        .expect(403)
        .expect((res) => expect(res.body.error.code).toBe('FORBIDDEN'));
      void ownList;

      const foreign = await api(parent)
        .get(`/people/persons/${childPersonId}/students/${unrelatedStudentId}`)
        .expect(403);
      expect(foreign.body.error.code).toBe('FORBIDDEN');

      await api(parent)
        .post(`/people/persons/${childPersonId}/students`)
        .send({ gradeLevel: 'SS1', enrollmentType: 'NEW' })
        .expect(403);
    });

    it('cross-tenant isolation: foreign tenant person is forbidden to every Greenfield principal', async () => {
      const iso = await createIsolatedTenant('b');

      const isoToken = await login(`iso.b.${suffix}@people2-b-${suffix}.edu.ng`, iso.slug);
      const isoPerson = await api(isoToken)
        .post('/people/persons')
        .send({
          firstName: 'Iso',
          lastName: 'Person',
          email: `iso.person.${suffix}@people2-b-${suffix}.edu.ng`,
          dateOfBirth: '2005-01-01',
          gender: 'FEMALE',
        })
        .expect(201);

      const foreignRead = await api(principal).get(`/people/persons/${isoPerson.body.data.id}`).expect(403);
      expect(foreignRead.body.error.code).toBe('FORBIDDEN');
      await api(studentMgmt).get(`/people/persons/${isoPerson.body.data.id}`).expect(403);
    });
  });
});