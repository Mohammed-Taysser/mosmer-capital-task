interface OrderConfirmedEvent {
  eventId: string;
  orderId: string;
  occurredAt: string;
  data: {
    confirmedAt: string;
  };
}

export { type OrderConfirmedEvent };
