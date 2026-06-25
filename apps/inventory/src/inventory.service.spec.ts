import { PrismaService, KAFKA_TOPICS, OrderCreatedEvent } from '@app/shared';
import { KafkaService } from '@app/shared/kafka/kafka.service';
import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';

jest.mock('@app/shared', () => ({
  KAFKA_TOPICS: jest.requireActual('@app/shared/kafka/topics').KAFKA_TOPICS,
  OrderCreatedEvent: class OrderCreatedEvent {},
  PrismaService: class PrismaService {},
}));

describe('InventoryService', () => {
  const mockEvent: OrderCreatedEvent = {
    eventId: 'evt-1',
    orderId: 1,
    correlationId: 'corr-1',
    occurredAt: new Date().toISOString(),
    data: {
      items: [
        { sku: 'SKU-101', quantity: 2 },
        { sku: 'SKU-102', quantity: 1 },
      ],
    },
  };

  const prisma = {
    $transaction: jest.fn(),
    processedEvent: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    stock: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const kafka = {
    emitEvent: jest.fn(),
  };

  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: prisma },
        { provide: KafkaService, useValue: kafka },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    jest.clearAllMocks();
  });

  describe('processOrder', () => {
    it('successfully processes order with sufficient stock', async () => {
      const mockStock = { sku: 'SKU-101', quantity: 10 };
      prisma.stock.findUnique.mockResolvedValue(mockStock);
      prisma.stock.update.mockResolvedValue({ ...mockStock, quantity: 8 });
      prisma.$transaction.mockImplementation(async (callback) => {
        await callback(prisma);
      });

      await service.processOrder(mockEvent);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.stock.findUnique).toHaveBeenCalledWith({
        where: { sku: 'SKU-101' },
      });
      expect(prisma.stock.update).toHaveBeenCalledWith({
        where: { sku: 'SKU-101' },
        data: { quantity: { decrement: 2 } },
      });
      expect(kafka.emitEvent).toHaveBeenCalledWith(
        KAFKA_TOPICS.ORDER_CONFIRMED,
        expect.objectContaining({
          orderId: 1,
          correlationId: 'corr-1',
        }),
      );
    });

    it('emits ORDER_FAILED when stock is insufficient', async () => {
      const mockStock = { sku: 'SKU-101', quantity: 1 };
      prisma.stock.findUnique.mockResolvedValue(mockStock);
      prisma.$transaction.mockImplementation(async (callback) => {
        await callback(prisma);
      });

      await service.processOrder(mockEvent);

      expect(kafka.emitEvent).toHaveBeenCalledWith(
        KAFKA_TOPICS.ORDER_FAILED,
        expect.objectContaining({
          orderId: 1,
          correlationId: 'corr-1',
          data: { reason: 'Insufficient stock for SKU: SKU-101' },
        }),
      );
    });

    it('emits ORDER_FAILED when stock does not exist', async () => {
      prisma.stock.findUnique.mockResolvedValue(null);
      prisma.$transaction.mockImplementation(async (callback) => {
        await callback(prisma);
      });

      await service.processOrder(mockEvent);

      expect(kafka.emitEvent).toHaveBeenCalledWith(
        KAFKA_TOPICS.ORDER_FAILED,
        expect.objectContaining({
          orderId: 1,
          correlationId: 'corr-1',
          data: { reason: 'Insufficient stock for SKU: SKU-101' },
        }),
      );
    });

    it('handles multiple items in order', async () => {
      const eventWithMultipleItems: OrderCreatedEvent = {
        ...mockEvent,
        data: {
          items: [
            { sku: 'SKU-101', quantity: 2 },
            { sku: 'SKU-102', quantity: 3 },
          ],
        },
      };

      prisma.stock.findUnique.mockResolvedValue({
        sku: 'SKU-101',
        quantity: 10,
      });
      prisma.stock.update.mockResolvedValue({ sku: 'SKU-101', quantity: 8 });
      prisma.$transaction.mockImplementation(async (callback) => {
        await callback(prisma);
      });

      await service.processOrder(eventWithMultipleItems);

      expect(prisma.stock.findUnique).toHaveBeenCalledTimes(2);
      expect(prisma.stock.update).toHaveBeenCalledTimes(2);
    });
  });
});
