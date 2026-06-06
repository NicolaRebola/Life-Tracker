import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://life-tracker--portfolio-blog-ee307.us-east4.hosted.app',
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 8080);
}
void bootstrap();
