import {
  KAFKA_TOPICS,
  OrderConfirmedEvent,
  OrderFailedEvent,
} from '@app/shared';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersEventsController {
  constructor(private readonly ordersService: OrdersService) {}

  @EventPattern(KAFKA_TOPICS.ORDER_CONFIRMED)
  async handleOrderConfirmed(@Payload() event: OrderConfirmedEvent) {
    await this.ordersService.markOrderAsConfirmed(event.orderId);
  }

  @EventPattern(KAFKA_TOPICS.ORDER_FAILED)
  async handleOrderFailed(@Payload() event: OrderFailedEvent) {
    const reason = event.data?.reason || 'Inventory check failed';

    await this.ordersService.markOrderAsFailed(event.orderId, reason);
  }
}
