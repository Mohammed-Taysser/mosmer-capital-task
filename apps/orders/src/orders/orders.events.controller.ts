import {
  KAFKA_TOPICS,
  OrderConfirmedEvent,
  OrderFailedEvent,
  PrismaService,
} from '@app/shared';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersEventsController {
  private readonly logger = new Logger(OrdersEventsController.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  @EventPattern(KAFKA_TOPICS.ORDER_CONFIRMED)
  async handleOrderConfirmed(@Payload() event: OrderConfirmedEvent) {
    this.logger.log(
      `Received order.confirmed orderId=${event.orderId} correlationId=${event.correlationId}`,
    );

    const existingEvent = await this.prisma.processedEvent.findUnique({
      where: { eventId: event.eventId },
    });

    if (existingEvent) {
      this.logger.log(
        `Event ${event.eventId} already processed, skipping (correlationId=${event.correlationId})`,
      );
      return;
    }

    await this.ordersService.markOrderAsConfirmed(event.orderId);

    await this.prisma.processedEvent.create({
      data: { eventId: event.eventId, correlationId: event.correlationId },
    });
  }

  @EventPattern(KAFKA_TOPICS.ORDER_FAILED)
  async handleOrderFailed(@Payload() event: OrderFailedEvent) {
    this.logger.log(
      `Received order.failed orderId=${event.orderId} correlationId=${event.correlationId}`,
    );

    const existingEvent = await this.prisma.processedEvent.findUnique({
      where: { eventId: event.eventId },
    });

    if (existingEvent) {
      this.logger.log(
        `Event ${event.eventId} already processed, skipping (correlationId=${event.correlationId})`,
      );
      return;
    }

    const reason = event.data?.reason || 'Inventory check failed';

    await this.ordersService.markOrderAsFailed(event.orderId, reason);

    await this.prisma.processedEvent.create({
      data: { eventId: event.eventId, correlationId: event.correlationId },
    });
  }
}
