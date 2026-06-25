import { ApiProperty } from '@nestjs/swagger';

class OrderFailedData {
  @ApiProperty({ example: 'Insufficient stock for SKU: SKU-103' })
  reason!: string;
}

class OrderFailedEvent {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  eventId!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  correlationId!: string;

  @ApiProperty({ example: 14 })
  orderId!: number;

  @ApiProperty({ example: '2026-06-25T00:00:00.000Z' })
  occurredAt!: string;

  @ApiProperty({ type: () => OrderFailedData })
  data!: OrderFailedData;
}

export { OrderFailedData, OrderFailedEvent };
