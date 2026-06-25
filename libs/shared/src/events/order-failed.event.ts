interface OrderFailedEvent {
  eventId: string;
  orderId: string;
  occurredAt: string;
  data: {
    reason: string;
  };
}

export { type OrderFailedEvent };
