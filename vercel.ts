import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  await app.init();
  console.log('Nest serverless bootstrap starting...');
}
bootstrap();

export default server; // this is the handler Vercel needs
