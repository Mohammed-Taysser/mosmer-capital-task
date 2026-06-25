import { Module } from '@nestjs/common';
import { SharedModule } from '@app/shared';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [SharedModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
