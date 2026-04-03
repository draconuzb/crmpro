import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  coinPrice: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;
}
