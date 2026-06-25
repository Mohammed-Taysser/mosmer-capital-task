import {
  OrderConfirmedEvent,
  OrderFailedEvent,
  PrismaService,
} from '@app/shared';
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersEventsController } from './orders.events.controller';
import { OrdersService } from './orders.service';

jest.mock('@app/shared', () => ({
  KAFKA_TOPICS: jest.requireActual('@app/shared/kafka/topics').KAFKA_TOPICS,
  OrderConfirmedEvent: class OrderConfirmedEvent {},
  OrderFailedEvent: class OrderFailedEvent {},
  PrismaService: class PrismaService {},
}));

describe('OrdersEventsController', () => {
  const ordersService = {
    markOrderAsConfirmed: jest.fn(),
    markOrderAsFailed: jest.fn(),
  };

  const prisma = {
    processedEvent: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  let controller: OrdersEventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersEventsController],
      providers: [
        { provide: OrdersService, useValue: ordersService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    controller = module.get<OrdersEventsController>(OrdersEventsController);
    jest.clearAllMocks();
  });

  describe('handleOrderConfirmed', () => {
    it('calls markOrderAsConfirmed with order id', async () => {
      const event: OrderConfirmedEvent = {
        eventId: 'evt-1',
        orderId: 1,
        correlationId: 'corr-1',
        occurredAt: new Date().toISOString(),
        data: { confirmedAt: new Date().toISOString() },
      };

      await controller.handleOrderConfirmed(event);

      expect(ordersService.markOrderAsConfirmed).toHaveBeenCalledWith(1);
    });
  });

  describe('handleOrderFailed', () => {
    it('calls markOrderAsFailed with order id and reason', async () => {
      const event: OrderFailedEvent = {
        eventId: 'evt-1',
        orderId: 1,
        correlationId: 'corr-1',
        occurredAt: new Date().toISOString(),
        data: { reason: 'Insufficient stock' },
      };

      await controller.handleOrderFailed(event);

      expect(ordersService.markOrderAsFailed).toHaveBeenCalledWith(
        1,
        'Insufficient stock',
      );
    });

    it('uses default reason when data.reason is missing', async () => {
      const event: OrderFailedEvent = {
        eventId: 'evt-1',
        orderId: 1,
        correlationId: 'corr-1',
        occurredAt: new Date().toISOString(),
        data: { reason: '' },
      };

      await controller.handleOrderFailed(event);

      expect(ordersService.markOrderAsFailed).toHaveBeenCalledWith(
        1,
        'Inventory check failed',
      );
    });
  });
});
