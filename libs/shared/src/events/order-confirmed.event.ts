class OrderConfirmedEvent {
  eventId!: string;
  correlationId!: string;
  orderId!: number;
  occurredAt!: string;
  data!: {
    confirmedAt: string;
  };
}

export { OrderConfirmedEvent };
