import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { InventoryModule } from './inventory.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    InventoryModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: process.env.KAFKA_INVENTORY_CLIENT_ID!,
          brokers: process.env.KAFKA_BROKERS!.split(',').map((b) => b.trim()),
        },
        consumer: {
          groupId: process.env.KAFKA_INVENTORY_GROUP_ID!,
        },
      },
    },
  );

  await app.listen();
}

void bootstrap();
