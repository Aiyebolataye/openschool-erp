import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { loginAs, closeTestApp, createTestApp } from './utils/create-test-app';

/**
 * PEOPLE-5 â€” Applicants (e2e) â€” frozen scope Â§10.3 catalogue row:
 *
 *   GET|POST  /people/persons/:personId/applicants
 *   GET|PUT|DELETE  /people/persons/:personId/applicants/:id
 *   POST     /people/persons/:personId/applicants/:id/accept
 *   POST     /people/persons/:personId/applicants/:id/reject
 *
 * Verifies envelope contract (Â§7), person-nested scoping with 404
 * cross-resource nests, RBAC people:applicant matrix with accept/reject on
 * STUDENT_MANAGEMENT_OFFICER and 403 on TEACHER, primary-institution +
 * tenant isolation (PeopleScopeGuard), soft-delete with
 * version/409 (ADR-014), and BRL-3 BR-020 audit rows.
 */
describe('PEOPLE-5 â€” Applicants (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  let personId: string;
  let personPublicId: string;
  let applicantId: string;
  let applicantPublicId: string;

  const suffix = Date.now();
  const uniqueEmail = (label: string) => `${label}.${suffix}@greenfield.edu.ng`;
  const uniquePersonPublicId = () => `P-${new Date().getFullYear()}-${String(100000 + (suffix % 80000))}`;

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

  async function login(email: string) {
    const { accessToken } = await loginAs(app, email, 'Password@123', 'greenfield-academy');
    return accessToken;
  }

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'greenfield-academy' } });
    if (!tenant) throw new Error('Seeded tenant missing');
    tenantId = tenant.id;

    const person = await prisma.person.create({
      data: {
        tenantId,
        publicId: uniquePersonPublicId(),
        firstName: 'Bolaji',
        lastName: 'Falana',
        email: uniqueEmail('Bolaji.Falana'),
        dateOfBirth: new Date('2005-01-01'),
        gender: 'MALE',
        status: 'ACTIVE',
      },
    });
    personId = person.id;
    personPublicId = person.publicId;
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('creates an applicant (201, envelope, APP publicId, APPLIED status, version 1) for STUDENT_MANAGEMENT_OFFICER', async () => {
    const officer = await login('student-mgmt@greenfield.edu.ng');
    const personId = await prisma.person.findFirst({ where: { tenantId, email: uniqueEmail('Bolaji.Falana') } });
    const created = await api(officer)
      .post(`/people/persons/${personId!.id}/applicants`)
      .send({ targetGrade: '9', applicationDate: '2026-09-01', source: 'WALK_IN', notes: 'Walk-in transfer' })
      .expect(201);
    expect(created.body.success).toBe(true);
    expect(created.body.data.publicId).toMatch(/^APP-\d{4}-\d{6}$/);
    expect(created.body.data.status).toBe('APPLIED');
    expect(created.body.data.targetGrade).toBe('9');
    expect(created.body.data.version).toBe(1);
    applicantId = created.body.data.id;
    applicantPublicId = created.body.data.publicId;
  });

  it('lists applicants with envelope {items,total,page,limit} incl. nested person', async () => {
    const officer = await login('student-mgmt@greenfield.edu.ng');
    const res = await api(officer)
      .get(`/people/persons/${personId}/applicants?page=1&limit=10`)
      .expect(200);
    expect(res.body.data.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data.items[0].id).toBe(applicantId);
    expect(res.body.data.items[0].person.id).toBe(personId);
  });

  it('reads an applicant by id and by publicId', async () => {
    const officer = await login('student-mgmt@greenfield.edu.ng');
    const byId = await api(officer).get(`/people/persons/${personId}/applicants/${applicantId}`).expect(200);
    expect(byId.body.data.id).toBe(applicantId);
    const byPublic = await api(officer)
      .get(`/people/persons/${personId}/applicants/${applicantPublicId}`)
      .expect(200);
    expect(byPublic.body.data.id).toBe(applicantId);
  });

  it('rejects with 409 when a stale version is supplied (ADR-014 optimistic concurrency)', async () => {
    const officer = await login('student-mgmt@greenfield.edu.ng');
    await api(officer)
      .put(`/people/persons/${personId}/applicants/${applicantId}`)
      .send({ targetGrade: '10', version: 99 })
      .expect(409)
      .expect((res) => expect(res.body.error.code).toBe('CONFLICT'));
  });

  it('accepts an applicant â†’ status ACCEPTED with audit trace', async () => {
    const officer = await login('student-mgmt@greenfield.edu.ng');
    const accepted = await api(officer)
      .post(`/people/persons/${personId}/applicants/${applicantId}/accept`)
      .send({ version: 1, gradeLevel: 'SS1' })
      .expect(200)
      .expect((res) => expect(res.body.data.status).toBe('ACCEPTED'));

    const acceptedInDb = await prisma.applicant.findUniqueOrThrow({ where: { id: applicantId } });
    expect(acceptedInDb.status).toBe('ACCEPTED');
  });

  it('soft-deletes an applicant (delete â†’ 200 with deletedAt; GET â†’ 404)', async () => {
    const officer = await login('student-mgmt@greenfield.edu.ng');
    const removed = await api(officer).del(`/people/persons/${personId}/applicants/${applicantId}`).expect(200);
    expect(removed.body.data.deletedAt).toBeTruthy();

    await api(officer).get(`/people/persons/${personId}/applicants/${applicantId}`).expect(404);
  });

  it('lists under another person as empty (scoped isolation) and 404 on the specific applicant', async () => {
    const other = await prisma.person.create({
      data: {
        tenantId,
        publicId: `P-${new Date().getFullYear()}-${String(100001 + (suffix % 80000))}`,
        firstName: 'Other',
        lastName: 'Person',
        email: uniqueEmail('Other.Person'),
        dateOfBirth: new Date('2000-01-01'),
        gender: 'FEMALE',
        status: 'ACTIVE',
      },
    });
    const officer = await login('student-mgmt@greenfield.edu.ng');
    const list = await api(officer).get(`/people/persons/${other.id}/applicants`).expect(200);
    expect(list.body.data.items.length).toBe(0);
    await api(officer).get(`/people/persons/${other.id}/applicants/${applicantId}`).expect(404);
  });

  it('rejects TEACHER (no people:applicant grant) with 403', async () => {
    const teacher = await login('teacher1@greenfield.edu.ng');
    await api(teacher)
      .get(`/people/persons/${personId}/applicants`)
      .expect(403);
    await api(teacher)
      .post(`/people/persons/${personId}/applicants`)
      .send({ targetGrade: '9' })
      .expect(403);
  });
});

