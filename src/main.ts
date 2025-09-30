import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   // to set a global prefix for all routes
  app.setGlobalPrefix('api');
 
  // to enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));

  // Stripe webhook raw body preserve
  app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
