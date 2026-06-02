import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://life-tracker-894343441345.us-central1.run.app',
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
