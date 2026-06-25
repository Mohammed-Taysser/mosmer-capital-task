import { Injectable, Logger } from '@nestjs/common';
import { KAFKA_TOPICS, PrismaService, OrderCreatedEvent } from '@app/shared';
import { KafkaService } from '@app/shared/kafka/kafka.service';
import { randomUUID } from 'node:crypto';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  async processOrder(event: OrderCreatedEvent): Promise<void> {
    const { orderId, correlationId, data } = event;
    const { items } = data;

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const item of items) {
          const stock = await tx.stock.findUnique({
            where: { sku: item.sku },
          });

          if (!stock || stock.quantity < item.quantity) {
            throw new Error(`Insufficient stock for SKU: ${item.sku}`);
          }
        }

        for (const item of items) {
          await tx.stock.update({
            where: { sku: item.sku },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      });

      this.kafka.emitEvent(KAFKA_TOPICS.ORDER_CONFIRMED, {
        eventId: randomUUID(),
        correlationId,
        orderId,
        occurredAt: new Date().toISOString(),
        data: {
          confirmedAt: new Date().toISOString(),
        },
      });
      this.logger.log(
        `Published order.confirmed orderId=${orderId} correlationId=${correlationId}`,
      );
    } catch (error) {
      this.kafka.emitEvent(KAFKA_TOPICS.ORDER_FAILED, {
        eventId: randomUUID(),
        correlationId,
        orderId,
        occurredAt: new Date().toISOString(),
        data: {
          reason:
            error instanceof Error ? error?.message : 'Unknown inventory error',
        },
      });
      this.logger.log(
        `Published order.failed orderId=${orderId} correlationId=${correlationId}`,
      );
    }
  }
}
