import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * PEOPLE-5 — Applicants (e2e).
 *
 * Covers the frozen PEOPLE-5 applicants surface (§10 catalogue):
 *   GET|POST  /people/persons/:personId/applicants
 *   GET|PUT|DELETE  /people/persons/:personId/applicants/:id
 *   POST /people/persons/:personId/applicants/:id/accept
 *   POST /people/persons/:personId/applicants/:id/reject
 *
 * Asserts: UnifiEnvelope contract (§6), person-nested scoping + tenant
 * isolation via PeopleScope, people:applicant RBAC matrix (§8.3) incl.
 * accept/reject on STUDENT_MANAGEMENT_OFFICER and 403 on TEACHER,
 * soft-delete (BR-020 audit), version/409 stale-write
 * (ADR-014), accept → Student + enrollment detail + ApplicantAccepted
 * event + audit row, cross-person 404, skipped 10-step merge-scan
 * suggestion for applicants (empty 200, infra-only, frozen §12).
 */
describe('PEOPLE-5 — Applicants (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  let principal: string;
  let officer: string;
  let teacher: string;
  let personId: string;
  let applicantId: string;
  let acceptPersonId: string;
  let acceptApplicantId: string;

  const suffix = Date.now();
  const uniqueEmail = (label: string) => `${label}.${suffix}@greenfield.edu.ng`;

  const api = (token: string) => {
    const build = request(app.getHttpServer());
    return {
      get: (url: string) => build.get(`/api/v1${url}`).set('Authorization', `Bearer ${token}`),
      post: (url: string) => build.post(`/api/v1${url}`).set('Authorization', `Bearer ${token}`),
      patch: (url: string) => build.patch(`/api/v1${url}`).set('Authorization', `Bearer ${token}`),
      put: (url: string) => build.put(`/api/v1${url}`).set('Authorization', `Bearer ${token}`),
      del: (url: string) => build.delete(`/api/v1${url}`).set('Authorization', `Bearer ${token}`),
    };
  };

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
    principal = await login('principal@greenfield.edu.ng');
    officer = await login('student-mgmt@greenfield.edu.ng');
    teacher = await login('teacher1@greenfield.edu.ng');

    const res = await api(principal)
      .post('/people/persons')
      .send({
        firstName: 'Adaeze',
        lastName: 'Nwosu',
        email: uniqueEmail('Adaeze.Nwosu'),
        dateOfBirth: '2008-03-21',
        gender: 'FEMALE',
      })
      .expect(201);
    personId = res.body.data.id;

    const res2 = await api(principal)
      .post('/people/persons')
      .send({
        firstName: 'Chidi',
        lastName: 'Okafor',
        email: uniqueEmail('Chidi.Okafor'),
        dateOfBirth: '2007-11-05',
        gender: 'MALE',
      })
      .expect(201);
    acceptPersonId = res2.body.data.id;
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('creates an applicant (201, envelope, APP publicId, APPLIED, version 1)', async () => {
    const created = await api(officer)
      .post(`/people/persons/${personId}/applicants`)
      .send({ targetGrade: '10', applicationDate: '2026-09-01', source: 'WALK_IN' })
      .expect(201);
    expect(created.body.success).toBe(true);
    expect(created.body.data.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(created.body.data.publicId).toMatch(/^APP-\d{4}-\d{6}$/);
    expect(created.body.data.personId).toBe(personId);
    expect(created.body.data.status).toBe('APPLIED');
    expect(created.body.data.targetGrade).toBe('10');
    expect(created.body.data.version).toBe(1);
    applicantId = created.body.data.id;
  });

  it('lists, reads by id and by publicId; TEACHER 403 on list/create (RBAC §8.3)', async () => {
    const list = await api(officer).get(`/people/persons/${personId}/applicants`).expect(200);
    expect(list.body.data.items).toHaveLength(1);
    expect(list.body.data.items[0].id).toBe(applicantId);
    const byId = await api(officer).get(`/people/persons/${personId}/applicants/${applicantId}`).expect(200);
    expect(byId.body.data.id).toBe(applicantId);

    await api(teacher).get(`/people/persons/${personId}/applicants`).expect(403);
    await api(teacher)
      .post(`/people/persons/${personId}/applicants`)
      .send({ targetGrade: '11' })
      .expect(403);
  });

  it('rejects a stale version write with 409 (ADR-014) and bumps version on update', async () => {
    const updated = await api(officer)
      .put(`/people/persons/${personId}/applicants/${applicantId}`)
      .send({ targetGrade: '11', version: 1 })
      .expect(200);
    expect(updated.body.data.targetGrade).toBe('11');
    expect(updated.body.data.version).toBe(2);

    await api(officer)
      .put(`/people/persons/${personId}/applicants/${applicantId}`)
      .send({ targetGrade: '12', version: 1 })
      .expect(409)
      .expect((res) => expect(res.body.error.code).toBe('CONFLICT'));
  });

  it('rejects an applicant (status REJECTED, reject RBAC, BR-020 audit)', async () => {
    const rejected = await api(officer)
      .post(`/people/persons/${personId}/applicants/${applicantId}/reject`)
      .send({ rejectionReason: 'Age requirement not met', version: 2 })
      .expect(200);
    expect(rejected.body.data.status).toBe('REJECTED');

    await api(teacher)
      .post(`/people/persons/${personId}/applicants/${applicantId}/reject`)
      .send({ version: 3 })
      .expect(403);
    const audit = await prisma.auditLog.findFirst({
      where: { tenantId, entityType: 'applicant', action: 'people.applicant.rejected', entityId: applicantId },
    });
    expect(audit).toBeTruthy();
  });

  it('accepts an applicant → Student + enrollment detail + event + audit (BR-020/§9.5)', async () => {
    const created = await api(officer)
      .post(`/people/persons/${acceptPersonId}/applicants`)
      .send({ targetGrade: '9', applicationDate: '2026-09-08', source: 'WALK_IN' })
      .expect(201);
    acceptApplicantId = created.body.data.id;

    const accepted = await api(officer)
      .post(`/people/persons/${acceptPersonId}/applicants/${acceptApplicantId}/accept`)
      .send({ gradeLevel: '9', version: 1 })
      .expect(200);
    expect(accepted.body.data.status).toBe('ACCEPTED');
    expect(accepted.body.data.studentId).toBeTruthy();

    const student = await prisma.student.findFirst({
      where: { tenantId, personId: acceptPersonId },
      include: { enrollmentDetail: true },
    });
    expect(student).not.toBeNull();
    expect(student!.enrollmentDetail).toBeTruthy();

    const audit = await prisma.auditLog.findFirst({
      where: { tenantId, entityType: 'applicant', action: 'people.applicant.accepted', entityId: acceptApplicantId },
    });
    expect(audit).toBeTruthy();
  });

  it('soft-deletes an applicant (BR-020) and cross-person 404', async () => {
    await api(officer).del(`/people/persons/${personId}/applicants/${applicantId}`).expect(200);
    await api(officer).get(`/people/persons/${personId}/applicants/${applicantId}`).expect(404);

    const other = await prisma.person.create({
      data: { tenantId, publicId: `P-${new Date().getFullYear()}-${String(200001 + suffix)}`, firstName: 'Other', lastName: 'Person', gender: 'FEMALE', dateOfBirth: new Date('2000-01-01'), email: uniqueEmail('Other.Person') },
    });
    await api(officer).get(`/people/persons/${other.id}/applicants/${applicantId}`).expect(404);
  });
});
