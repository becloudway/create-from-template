import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 80;
  await app.listen(port);
  new Logger('Main').log(`Application ready and listening on port ${port}`);
}
bootstrap();
