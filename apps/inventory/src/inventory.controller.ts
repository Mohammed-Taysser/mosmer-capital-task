import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS, OrderCreatedEvent } from '@app/shared';
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @EventPattern(KAFKA_TOPICS.ORDER_CREATED)
  async handleOrderCreated(@Payload() event: OrderCreatedEvent) {
    this.logger.log(
      `Received order.created orderId=${event.orderId} correlationId=${event.correlationId}`,
    );

    await this.inventoryService.processOrder(event);
  }
}
