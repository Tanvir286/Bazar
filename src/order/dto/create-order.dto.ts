// create-order.dto.ts
import { IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderProductDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  items: OrderProductDto[];
}
