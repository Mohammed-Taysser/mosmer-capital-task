interface OrderCreatedEvent {
  eventId: string;
  orderId: string;
  occurredAt: string;
  data: {
    items: Array<{
      sku: string;
      quantity: number;
    }>;
  };
}

export { type OrderCreatedEvent };
