import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KAFKA_TOPICS } from './topics';

@Injectable()
class KafkaService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject('ORDERS_KAFKA_CLIENT')
    private readonly orderKafkaClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.orderKafkaClient.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.orderKafkaClient.close();
  }

  emitEvent(topic: KAFKA_TOPICS, data: unknown) {
    return this.orderKafkaClient.emit(topic, JSON.stringify(data));
  }

  sendRequest(topic: KAFKA_TOPICS, data: unknown) {
    return this.orderKafkaClient.send(topic, JSON.stringify(data));
  }
}

export { KafkaService };
