/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://192.168.248.172:8081'], // Allow frontend on these ports
    credentials: true,
  });

  // Serve static files from the uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // This will serve files from the uploads directory
  });

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3000);
}
//Creating new Branch
bootstrap();
