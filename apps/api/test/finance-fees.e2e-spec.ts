import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * P6.1 — Finance fee structure (e2e).
 *
 * Covers: unauthenticated 401, non-admin 403 (P6.1 grants `finance:*` to the
 * five admin roles only, mirroring the P4.1 precedent), the canonical envelope
 * for lists, fee category create + duplicate 409, fee item create with a
 * 2-decimal amount, DTO validation (400 for >2 decimals, negative amount,
 * missing/blank name, dropped public DTO fields), V-FI-02 unknown category
 * 404, optimistic versioning 409, and TI-001/TI-002 cross-institution isolation
 * (object scope 403, list excludes foreign rows).
 *
 * Requires the seeded database (Docker/Postgres/Redis) via global-setup;
 * authored here, not runnable in the static-gate environment.
 */
describe('P6.1 — Finance fee structure (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  let institutionId: string;

  const suffix = Date.now();

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    const tenant = await prisma.tenant.findUnique({
      where: { slug: 'greenfield-academy' },
    });
    if (!tenant) throw new Error('Seeded tenant missing');
    tenantId = tenant.id;
    const institution = await prisma.institution.findFirst({
      where: { tenantId: tenant.id },
    });
    if (!institution) throw new Error('Seeded institution missing');
    institutionId = institution.id;
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  function api(accessToken: string) {
    const build = request(app.getHttpServer());
    return {
      get: (url: string) =>
        build.get(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`),
      post: (url: string) =>
        build.post(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`),
      put: (url: string) =>
        build.put(`/api/v1${url}`).set('Authorization', `Bearer ${accessToken}`),
    };
  }

  async function login(email: string, slug = 'greenfield-academy') {
    const { accessToken } = await loginAs(app, email, 'Password@123', slug);
    return accessToken;
  }

  const admin = () => login('admin@greenfield.edu.ng');

  it('rejects unauthenticated access with 401', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/finance/fees/categories')
      .expect(401);
  });

  it('rejects a non-admin (TEACHER) with 403 — P6.1 finance grants are admin-only', async () => {
    const token = await login('teacher1@greenfield.edu.ng');
    await api(token).get('/finance/fees/categories').expect(403);
    await api(token).get('/finance/fees/items').expect(403);
  });

  it('lists categories in the canonical envelope (items/total/page/limit)', async () => {
    const token = await admin();
    const res = await api(token).get('/finance/fees/categories?page=1&limit=20').expect(200);
    expect(res.body).toMatchObject({
      success: true,
      data: expect.objectContaining({
        items: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        limit: 20,
      }),
    });
  });

  it('creates a fee category and rejects the duplicate name with 409', async () => {
    const token = await admin();
    const name = `Tuition ${suffix}`;

    const created = await api(token)
      .post('/finance/fees/categories')
      .send({ name, description: 'Termly tuition' })
      .expect(201);
    expect(created.body.data).toMatchObject({ name, version: 1 });
    expect(created.body.data.tenantId).toBe(tenantId);
    expect(created.body.data.institutionId).toBe(institutionId);

    await api(token)
      .post('/finance/fees/categories')
      .send({ name })
      .expect(409);
  });

  it('rejects a category create carrying dropped public DTO fields with 400', async () => {
    const token = await admin();
    await api(token)
      .post('/finance/fees/categories')
      .send({ name: `Injection ${suffix}`, tenantId, institutionId })
      .expect(400);
  });

  it('rejects a blank category name with 400', async () => {
    const token = await admin();
    await api(token)
      .post('/finance/fees/categories')
      .send({ name: '' })
      .expect(400);
  });

  it('creates a fee item with a 2-decimal amount and ACTIVE status', async () => {
    const token = await admin();
    const category = await api(token)
      .post('/finance/fees/categories')
      .send({ name: `Items ${suffix}` })
      .expect(201);

    const created = await api(token)
      .post('/finance/fees/items')
      .send({
        feeCategoryId: category.body.data.id,
        name: 'Tuition Term 1',
        amount: 150000.5,
      })
      .expect(201);

    expect(created.body.data).toMatchObject({
      name: 'Tuition Term 1',
      feeCategoryId: category.body.data.id,
      status: 'ACTIVE',
      // Monetary values are emitted as fixed 2-decimal strings, never floats.
      amount: '150000.50',
    });
  });

  it('rejects a fee item amount with more than 2 decimals or a negative value with 400', async () => {
    const token = await admin();
    const category = await api(token)
      .post('/finance/fees/categories')
      .send({ name: `Validation ${suffix}` })
      .expect(201);
    const feeCategoryId = category.body.data.id;

    await api(token)
      .post('/finance/fees/items')
      .send({ feeCategoryId, name: 'Rounded', amount: 100.005 })
      .expect(400);
    await api(token)
      .post('/finance/fees/items')
      .send({ feeCategoryId, name: 'Negative', amount: -1 })
      .expect(400);
    await api(token)
      .post('/finance/fees/items')
      .send({ feeCategoryId, name: 'NoAmount' })
      .expect(400);
  });

  it('rejects a fee item for an unknown category with 404 (V-FI-02)', async () => {
    const token = await admin();
    await api(token)
      .post('/finance/fees/items')
      .send({
        feeCategoryId: '00000000-0000-4000-8000-000000000000',
        name: 'Orphan',
        amount: 1000,
      })
      .expect(404);
  });

  it('lists fee items filtered by category with the canonical envelope', async () => {
    const token = await admin();
    const category = await api(token)
      .post('/finance/fees/categories')
      .send({ name: `Filter ${suffix}` })
      .expect(201);
    const feeCategoryId = category.body.data.id;
    await api(token)
      .post('/finance/fees/items')
      .send({ feeCategoryId, name: 'Lab fee', amount: 25 })
      .expect(201);
    await api(token)
      .post('/finance/fees/items')
      .send({ feeCategoryId, name: 'Field trip', amount: 75 })
      .expect(201);

    const res = await api(token)
      .get(`/finance/fees/items?feeCategoryId=${feeCategoryId}&page=1&limit=20`)
      .expect(200);
    expect(res.body.data.total).toBe(2);
    for (const item of res.body.data.items) {
      expect(item.feeCategoryId).toBe(feeCategoryId);
      expect(typeof item.amount).toBe('string');
    }
  });

  it('updates a fee item status and enforces optimistic versioning with 409', async () => {
    const token = await admin();
    const category = await api(token)
      .post('/finance/fees/categories')
      .send({ name: `Versioning ${suffix}` })
      .expect(201);
    const item = await api(token)
      .post('/finance/fees/items')
      .send({ feeCategoryId: category.body.data.id, name: 'Library', amount: 10 })
      .expect(201);

    const updated = await api(token)
      .put(`/finance/fees/items/${item.body.data.id}`)
      .send({ status: 'INACTIVE', version: 1 })
      .expect(200);
    expect(updated.body.data).toMatchObject({ status: 'INACTIVE', version: 2 });

    await api(token)
      .put(`/finance/fees/items/${item.body.data.id}`)
      .send({ status: 'ACTIVE', version: 1 })
      .expect(409);
  });

  it('isolates the catalogue across institutions (TI-001 / TI-002)', async () => {
    const token = await admin();
    const other = await prisma.institution.create({
      data: {
        tenantId,
        name: 'P6.1 E2E Other',
        code: `P61OTHER${String(suffix).slice(-6)}`,
        status: 'PROVISIONING',
      },
    });
    const foreignCategory = await prisma.feeCategory.create({
      data: { tenantId, institutionId: other.id, name: `Foreign ${suffix}` },
    });
    const foreignItem = await prisma.feeItem.create({
      data: {
        tenantId,
        institutionId: other.id,
        feeCategoryId: foreignCategory.id,
        name: `Foreign item ${suffix}`,
        amount: '500.00',
      },
    });

    // Object scope fails closed for a foreign-institution object.
    await api(token)
      .put(`/finance/fees/categories/${foreignCategory.id}`)
      .send({ description: 'hijack' })
      .expect(403);
    await api(token)
      .put(`/finance/fees/items/${foreignItem.id}`)
      .send({ name: 'hijack' })
      .expect(403);

    // Lists never expose another institution's rows.
    const categories = await api(token).get('/finance/fees/categories?limit=100').expect(200);
    expect(
      categories.body.data.items.some(
        (row: { id: string }) => row.id === foreignCategory.id,
      ),
    ).toBe(false);
    const items = await api(token).get('/finance/fees/items?limit=100').expect(200);
    expect(
      items.body.data.items.some((row: { id: string }) => row.id === foreignItem.id),
    ).toBe(false);
  });
});
