import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'ORDERS_KAFKA_CLIENT',
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
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
        }),
        inject: [ConfigService],
      },
      {
        name: 'INVENTORY_KAFKA_CLIENT',
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: config.getOrThrow<string>('KAFKA_INVENTORY_CLIENT_ID'),
              brokers: config.getOrThrow<string[]>('KAFKA_BROKERS'),
            },
            consumer: {
              groupId: config.getOrThrow<string>('KAFKA_INVENTORY_GROUP_ID'),
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {}
