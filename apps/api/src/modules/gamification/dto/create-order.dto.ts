import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  studentId: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  productId: number;
}
