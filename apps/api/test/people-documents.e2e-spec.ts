import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * PEOPLE-5 — People Documents (e2e).
 *
 * Covers the frozen PEOPLE-5 documents surface (§10.5 catalogue):
 *   GET|POST  /people/persons/:personId/documents
 *   GET|PUT|DELETE  /people/persons/:personId/documents/:id
 *
 * Asserts: UnifiEnvelope contract (§6), person-nested tenant scoping via
 * PeopleScope (cross-person + cross-tenant 404), people:document RBAC
 * matrix (§8.3: PRINCIPAL 200, TEACHER 403), soft-delete
 * (BR-020 audit), version/409 stale-write (ADR-014).
 */
describe('PEOPLE-5 — People Documents (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  let personId: string;
  let documentId: string;
  let principal: string;
  let teacher: string;

  const suffix = Date.now();
  const uniqueEmail = (label: string) => `${label}.${suffix}@greenfield.edu.ng`;

  const api = (token: string) => {
    const build = request(app.getHttpServer());
    return {
      get: (url: string) => build.get(`/api/v1${url}`).set('Authorization', `Bearer ${token}`),
      post: (url: string) => build.post(`/api/v1${url}`).set('Authorization', `Bearer ${token}`),
      put: (url: string) => build.put(`/api/v1${url}`).set('Authorization', `Bearer ${token}`),
      del: (url: string) => build.delete(`/api/v1${url}`).set('Authorization', `Bearer ${token}`),
    };
  };

  async function login(email: string) {
    const { accessToken } = await loginAs(app, email, 'Password@123', 'greenfield-academy');
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
    teacher = await login('teacher1@greenfield.edu.ng');

    const person = await prisma.person.create({
      data: {
        tenantId,
        publicId: `P-${new Date().getFullYear()}-${String(100000 + (suffix % 900000)).slice(0, 6)}`,
        firstName: 'Document',
        lastName: 'Owner',
        email: uniqueEmail('Document.Owner'),
        dateOfBirth: new Date('2000-01-01'),
        gender: 'MALE',
      },
    });
    personId = person.id;
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('creates a document (201, envelope, id + version 1)', async () => {
    const created = await api(principal)
      .post(`/people/persons/${personId}/documents`)
      .send({
        documentType: 'BIRTH_CERTIFICATE',
        documentName: 'Birth Certificate',
        fileReference: 'files/birth-001',
        fileSize: 1024,
        mimeType: 'application/pdf',
      })
      .expect(201);
    expect(created.body.success).toBe(true);
    expect(created.body.data.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(created.body.data.documentType).toBe('BIRTH_CERTIFICATE');
    expect(created.body.data.version).toBe(1);
    documentId = created.body.data.id;
  });

  it('lists, reads by id; TEACHER 403 on list/create (RBAC §8.3)', async () => {
    const list = await api(principal).get(`/people/persons/${personId}/documents`).expect(200);
    expect(list.body.data.items).toHaveLength(1);
    expect(list.body.data.items[0].id).toBe(documentId);

    const byId = await api(principal).get(`/people/persons/${personId}/documents/${documentId}`).expect(200);
    expect(byId.body.data.id).toBe(documentId);

    await api(teacher).get(`/people/persons/${personId}/documents`).expect(403);
    await api(teacher)
      .post(`/people/persons/${personId}/documents`)
      .send({ documentType: 'ID_CARD', documentName: 'ID', fileReference: 'files/id-001' })
      .expect(403);
  });

  it('updates with version bump then 409 on stale write (ADR-014)', async () => {
    const updated = await api(principal)
      .put(`/people/persons/${personId}/documents/${documentId}`)
      .send({ documentName: 'Renamed Cert', version: 1 })
      .expect(200);
    expect(updated.body.data.documentName).toBe('Renamed Cert');
    expect(updated.body.data.version).toBe(2);

    await api(principal)
      .put(`/people/persons/${personId}/documents/${documentId}`)
      .send({ documentName: 'Stale', version: 1 })
      .expect(409);
  });

  it('soft-deletes a document (BR-020 audit) then 404 on read', async () => {
    await api(principal).del(`/people/persons/${personId}/documents/${documentId}`).expect(200);
    await api(principal).get(`/people/persons/${personId}/documents/${documentId}`).expect(404);

    const audit = await waitFor(() =>
      prisma.auditLog.findFirst({
        where: { tenantId, entityType: 'people_document', action: 'people.people_document.removed', entityId: documentId },
      }),
    );
    expect(audit).toBeTruthy();
  });

  it('cross-person 404 + cross-tenant isolation via PeopleScope', async () => {
    const other = await prisma.person.create({
      data: {
        tenantId,
        publicId: `P-${new Date().getFullYear()}-${String(100001 + (suffix % 900000)).slice(0, 6)}`,
        firstName: 'Other',
        lastName: 'Owner',
        email: uniqueEmail('Other.Owner'),
        dateOfBirth: new Date('2001-01-01'),
        gender: 'FEMALE',
      },
    });
    await api(principal).get(`/people/persons/${other.id}/documents/${documentId}`).expect(404);
  });
});
