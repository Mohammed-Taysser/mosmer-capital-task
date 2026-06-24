import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export { OrderItemDto };
