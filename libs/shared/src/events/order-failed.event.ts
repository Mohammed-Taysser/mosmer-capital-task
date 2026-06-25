class OrderFailedEvent {
  eventId!: string;
  correlationId!: string;
  orderId!: number;
  occurredAt!: string;
  data?: {
    reason?: string;
  };
}

export { OrderFailedEvent };
