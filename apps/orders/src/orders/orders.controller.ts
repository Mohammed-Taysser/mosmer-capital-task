import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Orders')
@Controller('orders')
class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new order',
    description:
      'Persists the order as PENDING and asynchronously emits an order.created Kafka event for inventory validation.',
  })
  @ApiCreatedResponse({
    description: 'Order created successfully with PENDING status.',
  })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description:
      'Returns the current order status and items. Poll this endpoint after creation to see the final CONFIRMED or FAILED status.',
  })
  @ApiOkResponse({ description: 'Order found.' })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findById(id);
  }
}

export { OrdersController };
