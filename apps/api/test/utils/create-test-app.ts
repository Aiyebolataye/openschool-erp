import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app-http';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
}

export async function loginAs(
  app: INestApplication,
  email: string,
  password = 'Password@123',
  tenantSlug = 'greenfield-academy',
): Promise<LoginTokens> {
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email, password, tenantSlug })
    .expect(200);

  return {
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken,
  };
}

export async function closeTestApp(app: INestApplication | undefined): Promise<void> {
  if (app) {
    await app.close();
  }
}