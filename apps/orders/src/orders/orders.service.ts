import { KAFKA_TOPICS, OrderCreatedEvent, PrismaService } from '@app/shared';
import { KafkaService } from '@app/shared/kafka/kafka.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, type Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { CreateOrderDto } from './dto/create-order.dto';

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: true;
  };
}>;

@Injectable()
class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kafka: KafkaService,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderWithItems> {
    this.validateUniqueSkus(dto);

    const order = await this.prisma.order.create({
      data: {
        status: OrderStatus.PENDING,
        correlationId: randomUUID(),
        items: {
          create: dto.items.map((item) => ({
            sku: item.sku,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    const event: OrderCreatedEvent = {
      eventId: randomUUID(),
      correlationId: order.correlationId,
      orderId: order.id,
      occurredAt: order.createdAt.toISOString(),
      data: {
        items: order.items.map((item) => ({
          sku: item.sku,
          quantity: item.quantity,
        })),
      },
    };

    this.kafka.emitEvent(KAFKA_TOPICS.ORDER_CREATED, event);

    return order;
  }

  async findById(id: number): Promise<OrderWithItems> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async markOrderAsConfirmed(id: number): Promise<void> {
    await this.findById(id);

    await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CONFIRMED,
      },
    });
  }

  async markOrderAsFailed(id: number, reason: string): Promise<void> {
    await this.findById(id);

    await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.FAILED,
        failureReason: reason,
      },
    });
  }

  private validateUniqueSkus(dto: CreateOrderDto): void {
    const seenSkus = new Set<string>();

    for (const item of dto.items) {
      if (seenSkus.has(item.sku)) {
        throw new BadRequestException(
          `Duplicate SKU ${item.sku} in the same order`,
        );
      }

      seenSkus.add(item.sku);
    }
  }
}

export { OrdersService };
