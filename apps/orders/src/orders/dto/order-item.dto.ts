import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

class OrderItemDto {
  @ApiProperty({
    example: 'SKU-101',
    description: 'Stock-keeping unit identifier',
  })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({
    example: 2,
    description: 'Number of units to order',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export { OrderItemDto };
