import { PrismaService } from '@app/shared';
import { KafkaService } from '@app/shared/kafka/kafka.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';

jest.mock('@app/shared', () => ({
  KAFKA_TOPICS: jest.requireActual('@app/shared/kafka/topics').KAFKA_TOPICS,
  OrderCreatedEvent: class OrderCreatedEvent {},
  PrismaService: class PrismaService {},
}));

describe('OrdersService', () => {
  const mockOrder = {
    id: 1,
    status: OrderStatus.PENDING,
    correlationId: 'corr-1',
    failureReason: null,
    createdAt: new Date('2026-06-25T00:00:00.000Z'),
    updatedAt: new Date('2026-06-25T00:00:00.000Z'),
    items: [{ id: 1, sku: 'SKU-101', quantity: 2, orderId: 1 }],
  };

  const prisma = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const kafka = {
    emitEvent: jest.fn(),
  };

  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: KafkaService, useValue: kafka },
      ],
    }).compile();

    service = module.get(OrdersService);
    jest.clearAllMocks();
  });

  describe('markOrderAsConfirmed', () => {
    it('updates a pending order to CONFIRMED', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CONFIRMED,
      });

      await service.markOrderAsConfirmed(1);

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { items: true },
      });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: OrderStatus.CONFIRMED },
      });
    });

    it('throws NotFoundException when the order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.markOrderAsConfirmed(999)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.order.update).not.toHaveBeenCalled();
    });
  });

  describe('markOrderAsFailed', () => {
    it('updates a pending order to FAILED with a reason', async () => {
      prisma.order.findUnique.mockResolvedValue(mockOrder);
      prisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.FAILED,
        failureReason: 'Insufficient stock for SKU: SKU-101',
      });

      await service.markOrderAsFailed(1, 'Insufficient stock for SKU: SKU-101');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: OrderStatus.FAILED,
          failureReason: 'Insufficient stock for SKU: SKU-101',
        },
      });
    });

    it('throws NotFoundException when the order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(
        service.markOrderAsFailed(999, 'Inventory check failed'),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.order.update).not.toHaveBeenCalled();
    });
  });
});
