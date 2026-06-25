import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

jest.mock('@app/shared', () => ({
  KAFKA_TOPICS: jest.requireActual('@app/shared/kafka/topics').KAFKA_TOPICS,
  OrderCreatedEvent: class OrderCreatedEvent {},
  PrismaService: class PrismaService {},
}));

describe('OrdersController', () => {
  const mockOrder = {
    id: 1,
    status: OrderStatus.PENDING,
    correlationId: 'corr-1',
    failureReason: null,
    createdAt: new Date('2026-06-25T00:00:00.000Z'),
    updatedAt: new Date('2026-06-25T00:00:00.000Z'),
    items: [{ id: 1, sku: 'SKU-101', quantity: 2, orderId: 1 }],
  };

  const ordersService = {
    create: jest.fn(),
    findById: jest.fn(),
  };

  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a new order', async () => {
      const dto: CreateOrderDto = {
        items: [{ sku: 'SKU-101', quantity: 2 }],
      };
      ordersService.create.mockResolvedValue(mockOrder);

      const result = await controller.create(dto);

      expect(ordersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findOne', () => {
    it('returns an order by id', async () => {
      ordersService.findById.mockResolvedValue(mockOrder);

      const result = await controller.findOne(1);

      expect(ordersService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockOrder);
    });

    it('throws NotFoundException when order does not exist', async () => {
      ordersService.findById.mockRejectedValue(new Error('Order not found'));

      await expect(controller.findOne(999)).rejects.toThrow('Order not found');
      expect(ordersService.findById).toHaveBeenCalledWith(999);
    });
  });
});
