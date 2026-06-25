class OrderCreatedItem {
  sku!: string;
  quantity!: number;
}

class OrderCreatedEvent {
  eventId!: string;
  correlationId!: string;
  orderId!: number;
  occurredAt!: string;
  data!: {
    items: OrderCreatedItem[];
  };
}

export { OrderCreatedEvent, OrderCreatedItem };
