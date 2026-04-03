import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWithdrawalDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: ['CASH', 'CARD', 'TRANSFER'] })
  @IsEnum(['CASH', 'CARD', 'TRANSFER'], { message: 'method must be CASH, CARD, or TRANSFER' })
  method: 'CASH' | 'CARD' | 'TRANSFER';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  date?: string;
}
