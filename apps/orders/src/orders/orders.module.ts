import { Module } from '@nestjs/common';
import { PrismaService } from '@app/shared';
import { OrdersController } from './orders.controller';
import { OrdersEventsController } from './orders.events.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController, OrdersEventsController],
  providers: [OrdersService, PrismaService],
})
export class OrdersModule {}
