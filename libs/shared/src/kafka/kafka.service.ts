import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { OrderCreatedEvent } from '../events/order-created.event';
import { OrderConfirmedEvent } from '../events/order-confirmed.event';
import { OrderFailedEvent } from '../events/order-failed.event';
import { KAFKA_TOPICS } from './topics';

type KafkaEventPayload =
  | OrderCreatedEvent
  | OrderConfirmedEvent
  | OrderFailedEvent;

@Injectable()
class KafkaService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject('ORDERS_KAFKA_CLIENT')
    private readonly ordersClient: ClientKafka,
    @Inject('INVENTORY_KAFKA_CLIENT')
    private readonly inventoryClient: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    await Promise.all([
      this.ordersClient.connect(),
      this.inventoryClient.connect(),
    ]);
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([
      this.ordersClient.close(),
      this.inventoryClient.close(),
    ]);
  }

  emitEvent(topic: KAFKA_TOPICS, payload: KafkaEventPayload) {
    const client =
      topic === KAFKA_TOPICS.ORDER_CREATED
        ? this.ordersClient
        : this.inventoryClient;

    return client.emit(topic, {
      key: String(payload.orderId),
      value: payload,
    });
  }
}

export { KafkaService };
