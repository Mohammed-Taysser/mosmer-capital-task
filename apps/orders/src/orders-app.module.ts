import { Module } from '@nestjs/common';
import { SharedModule } from '@app/shared';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [SharedModule, OrdersModule],
})
export class OrdersAppModule {}
