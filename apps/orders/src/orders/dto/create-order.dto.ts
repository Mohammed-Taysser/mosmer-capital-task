import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, ValidateNested } from 'class-validator';
import { OrderItemDto } from './order-item.dto';

class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto], description: 'List of items to order' })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[] = [];
}

export { CreateOrderDto };
