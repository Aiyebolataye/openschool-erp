import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix(moduleRef.get(ConfigService).get('apiPrefix', 'api/v1'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

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
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
  };
}

export async function closeTestApp(app: INestApplication | undefined): Promise<void> {
  if (app) {
    await app.close();
  }
}