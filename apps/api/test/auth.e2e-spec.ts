import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, loginAs, closeTestApp } from './utils/create-test-app';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  }, 30000);

  afterAll(async () => {
    await closeTestApp(app);
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns tokens and user for valid principal credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'principal@greenfield.edu.ng',
          password: 'Password@123',
          tenantSlug: 'greenfield-academy',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.expiresIn).toBe(900);

      expect(res.body.data.user).toMatchObject({
        email: 'principal@greenfield.edu.ng',
        tenantSlug: 'greenfield-academy',
      });
      expect(res.body.data.user.roles).toContain('PRINCIPAL');
      expect(res.body.data.user.permissions).toBeInstanceOf(Array);
    });

    it('rejects wrong password with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'principal@greenfield.edu.ng',
          password: 'wrong-password',
          tenantSlug: 'greenfield-academy',
        })
        .expect(401);
    });

    it('rejects an unknown tenant slug with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'principal@greenfield.edu.ng',
          password: 'Password@123',
          tenantSlug: 'does-not-exist',
        })
        .expect(401);
    });

    it('rejects a malformed payload with 400 (validation pipe)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('rotates the access token using a valid refresh token', async () => {
      const { refreshToken } = await loginAs(app, 'teacher1@greenfield.edu.ng');

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.expiresIn).toBe(900);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns the current user for a valid access token', async () => {
      const { accessToken } = await loginAs(app, 'parent@greenfield.edu.ng');

      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.sub).toBeDefined();
      expect(res.body.data.tenantId).toBeDefined();
      expect(res.body.data.roles).toContain('PARENT');
    });

    it('rejects a request without a token with 401', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });
  });
});