import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, IsString, Min, Max, MaxLength, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  studentId: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(99999999999)
  amount: number;

  @ApiProperty({ enum: ['CASH', 'CARD', 'TRANSFER'] })
  @IsEnum(['CASH', 'CARD', 'TRANSFER'], { message: 'method must be CASH, CARD, or TRANSFER' })
  method: 'CASH' | 'CARD' | 'TRANSFER';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;
}
