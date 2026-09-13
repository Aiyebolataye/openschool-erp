import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app-http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  const port = app.get('ConfigService').get('port', 3000);
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}

bootstrap();