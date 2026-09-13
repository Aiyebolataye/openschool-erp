import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

/**
 * Shared HTTP hardening & envelope bootstrap (frozen B1 security-gate
 * remainder, absorbed into B5 per decision D-B5-1). Used identically by
 * `main.ts` (runtime) and the e2e `createTestApp` so the e2e surface matches
 * production wiring: CORS origin allow-list, Helmet/HSTS/CSP baseline, JSON
 * body-size limit, global prefix, ValidationPipe policy, and the Swagger gate.
 */
export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);
  const expressApp = app as NestExpressApplication;

  const origins: string[] = config.get<string[]>('cors.origins') ?? [];

  app.enableCors({
    origin: origins.length > 0 ? origins : false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  });

  app.use(
    helmet({
      strictTransportSecurity: {
        maxAge: config.get<number>('security.hstsMaxAgeSeconds', 15552000),
        includeSubDomains: config.get<boolean>(
          'security.hstsIncludeSubDomains',
          true,
        ),
      },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          frameAncestors: ["'self'"],
        },
      },
    }),
  );

  const bodyLimit = config.get<string>('http.bodyLimit', '1mb');
  expressApp.useBodyParser('json', { limit: bodyLimit });

  app.setGlobalPrefix(config.get('apiPrefix', 'api/v1'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // P1.6 Swagger gate: disabled in production unless SWAGGER_ENABLED=true.
  if (config.get<boolean>('swagger.enabled', true)) {
    const openApi = new DocumentBuilder()
      .setTitle('OpenSchool ERP API')
      .setDescription('Multi-tenant educational institution ERP platform')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, openApi);
    SwaggerModule.setup('api/docs', app, document);
  }
}