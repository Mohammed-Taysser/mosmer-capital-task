import { ApiProperty } from '@nestjs/swagger';

class OrderCreatedItem {
  @ApiProperty({ example: 'SKU-101' })
  sku!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  quantity!: number;
}

class OrderCreatedEvent {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  eventId!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  correlationId!: string;

  @ApiProperty({ example: 14 })
  orderId!: number;

  @ApiProperty({ example: '2026-06-25T00:00:00.000Z' })
  occurredAt!: string;

  @ApiProperty({ type: () => OrderCreatedItemData })
  data!: {
    items: OrderCreatedItem[];
  };
}

class OrderCreatedItemData {
  @ApiProperty({ type: [OrderCreatedItem] })
  items!: OrderCreatedItem[];
}

export { OrderCreatedEvent, OrderCreatedItem, OrderCreatedItemData };
