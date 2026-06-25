import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
        retry: {
          retries: 3,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 30000,
        },
      },
    },
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Orders Service')
    .setDescription(
      'REST API for creating and tracking orders.\n\n' +
        'Orders are created as **PENDING** and transition asynchronously to ' +
        '**CONFIRMED** or **FAILED** once the Inventory service processes the `order.created` Kafka event.',
    )
    .setVersion('1.0')
    .addTag('Orders')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(config.getOrThrow<number>('ORDERS_PORT'));
}

bootstrap();
