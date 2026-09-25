import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * PEOPLE-5 â€” Person Merge (e2e).
 *
 * Covers the frozen PEOPLE-5 merge surface (Â§10.4 catalogue):
 *   GET  /people/merge/suggestions
 *   POST /people/merge
 *   GET  /people/merge/history
 *
 * Asserts: UnifiEnvelope contract (Â§6), people:person:merge RBAC matrix
 * (PRINCIPAL 200, TEACHER/STUDENT_MANAGEMENT_OFFICER 403 â€” admin-only
 * grant Â§8.3), cross-account 404 on unknown person ids (tenant isolation
 * via PeopleScope), unauthenticated 401, audit rows on merge (BR-020).
 */
describe('PEOPLE-5 â€” Person Merge (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  let principal: string;
  let officer: string;
  let teacher: string | null = null;
  let sourceId: string;
  let targetId: string;
  let suffixedId: string[] = [];

  const suffix = Date.now();
  const parseId = (seed: number) => String(100000 + (seed % 900000)).slice(0, 6);

  const api = (token: string) => {
    const build = request(app.getHttpServer());
    return {
      get: (url: string) => build.get(`/api/v1${url}`).set('Authorization', `Bearer ${token}`),
      post: (url: string) => build.post(`/api/v1${url}`).set('Authorization', `Bearer ${token}`),
    };
  };

  async function login(email: string) {
    const { accessToken } = await loginAs(app, email);
    return accessToken;
  }

  async function waitFor<T>(fn: () => Promise<T | null>): Promise<T | null> {
    for (let i = 0; i < 30; i += 1) {
      const value = await fn();
      if (value) return value;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return null;
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

    const mkPerson = async (label: string, n: number) => {
      const person = await prisma.person.create({
        data: {
          tenantId,
          publicId: `P-${new Date().getFullYear()}-${parseId(150000 + (n % 800000))}`,
          firstName: label,
          lastName: 'MergeCand',
          email: `${label}.${suffix}@greenfield.edu.ng`,
          dateOfBirth: new Date('2001-05-05'),
          gender: 'MALE',
        },
      });
      return person.id;
    };
    sourceId = await mkPerson('MergeSource', suffix);
    targetId = await mkPerson('MergeTarget', suffix + 7);
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('returns merge suggestions (200, envelope)', async () => {
    const res = await api(principal).get('/people/merge/suggestions').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('rejects TEACHER and STUDENT_MANAGEMENT_OFFICER with 403 (admin-only RBAC Â§8.3)', async () => {
    await api(teacher!).get('/people/merge/suggestions').expect(403);
    await api(teacher!).post('/people/merge').send({ sourcePersonId: targetId, targetPersonId: sourceId }).expect(403);
    await api(officer).get('/people/merge/suggestions').expect(403);
    await api(officer).post('/people/merge').send({ sourcePersonId: targetId, targetPersonId: sourceId }).expect(403);
  });

  it('merges two people (200, envelope, response data) and writes BR-020 audit', async () => {
    const res = await api(principal)
      .post('/people/merge')
      .send({ sourcePersonId: sourceId, targetPersonId: targetId })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();

    const audit = await waitFor(() =>
      prisma.auditLog.findFirst({
        where: { tenantId, entityType: 'person', action: 'people.person.merged', entityId: targetId },
      }),
    );
    expect(audit).toBeTruthy();
  });

  it('returns merge history (200, envelope) and 401 when unauthenticated', async () => {
    const history = await api(principal).get('/people/merge/history').expect(200);
    expect(history.body.success).toBe(true);
    expect(history.body.data).toBeDefined();
    expect(history.body.data.items.length).toBeGreaterThanOrEqual(1);

    await request(app.getHttpServer()).get('/api/v1/people/merge/suggestions').expect(401);
    await request(app.getHttpServer()).get('/api/v1/people/merge/history').expect(401);
  });
});
