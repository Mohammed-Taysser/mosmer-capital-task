import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
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

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: config.getOrThrow<string>('KAFKA_ORDERS_CLIENT_ID'),
        brokers: config.getOrThrow<string[]>('KAFKA_BROKERS'),
      },
      consumer: {
        groupId: config.getOrThrow<string>('KAFKA_ORDERS_GROUP_ID'),
      },
    },
  });

  await app.startAllMicroservices();

  await app.listen(config.getOrThrow<number>('ORDERS_PORT'));
}

void bootstrap();
