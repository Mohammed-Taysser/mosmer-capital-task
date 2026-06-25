import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersEventsController } from './orders.events.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController, OrdersEventsController],
  providers: [OrdersService],
})
export class OrdersModule {}
