import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { OrdersAppModule } from './orders-app.module';

async function bootstrap() {
  const app = await NestFactory.create(OrdersAppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(config.getOrThrow<number>('ORDERS_PORT'));
}

void bootstrap();
