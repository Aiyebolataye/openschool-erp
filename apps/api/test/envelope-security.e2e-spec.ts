import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, closeTestApp } from './utils/create-test-app';

const BASE = '/api/v1';
const ALLOWED_ORIGIN = 'http://localhost:3001';

describe('Locked envelope + frozen-B1 security gate (D-07 / D-B5-1/5)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('renders the D-07 envelope for a 404 with correlating headers', async () => {
    const res = await request(app.getHttpServer())
      .get(`${BASE}/definitely-not-a-route`)
      .set('X-Correlation-ID', 'corr-404-test')
      .expect(404);

    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Cannot GET /api/v1/definitely-not-a-route',
        correlationId: 'corr-404-test',
        timestamp: expect.any(String),
      },
    });
    expect(res.headers['x-correlation-id']).toBe('corr-404-test');
  });

  it('renders the D-07 envelope for validation failures (400)', async () => {
    const res = await request(app.getHttpServer())
      .post(`${BASE}/auth/login`)
      .set('X-Correlation-ID', 'corr-400-test')
      .send({ email: 'not-an-email', password: '', tenantSlug: '' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.message).toBe('Validation failed');
    expect(res.body.error.details).toBeInstanceOf(Array);
    expect(res.body.error.correlationId).toBe('corr-400-test');
  });

  it('rejects oversized JSON bodies with an opaque 413 (body-size gate)', async () => {
    const huge = { email: `${'x'.repeat(4096)}@greenfield.edu.ng`, password: 'x', tenantSlug: 'y' };
    const res = await request(app.getHttpServer())
      .post(`${BASE}/auth/login`)
      .set('X-Correlation-ID', 'corr-413-test')
      .send(huge)
      .expect(413);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PAYLOAD_TOO_LARGE');
    expect(res.body.error.correlationId).toBe('corr-413-test');
    expect(res.headers['x-correlation-id']).toBe('corr-413-test');
  });

  it('sends the security headers baseline (HSTS + CSP)', async () => {
    const res = await request(app.getHttpServer()).get(`${BASE}/health`).expect(200);

    const hsts = res.headers['strict-transport-security'] as string;
    expect(hsts).toBeDefined();
    expect(hsts).toContain('max-age=15552000');
    expect(hsts).toContain('includeSubDomains');

    const csp = res.headers['content-security-policy'] as string;
    expect(csp).toBeDefined();
    expect(csp).toContain("'self'");
  });

  it('reflects only the configured CORS allow-list', async () => {
    const allowed = await request(app.getHttpServer())
      .options(`${BASE}/auth/login`)
      .set('Origin', ALLOWED_ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type')
      .expect(204);

    expect((allowed.headers['access-control-allow-origin'] as string) ?? '').toContain(
      ALLOWED_ORIGIN,
    );

    const denied = await request(app.getHttpServer())
      .options(`${BASE}/auth/login`)
      .set('Origin', 'http://evil.example')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type')
      .expect(204);

    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
});