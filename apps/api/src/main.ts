import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const config = app.get(ConfigService);

  app.use(helmet());
  app.setGlobalPrefix(config.get('apiPrefix', 'api/v1'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const openApi = new DocumentBuilder()
    .setTitle('OpenSchool ERP API')
    .setDescription('Multi-tenant educational institution ERP platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, openApi);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get('port', 3000);
  await app.listen(port);

  console.log(`Application running on port ${port}`);
  console.log(`API docs at http://localhost:${port}/api/docs`);
}

bootstrap();