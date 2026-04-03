import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKpiTargetDto {
  @ApiProperty({ example: 'leads' })
  @IsString()
  metric: string;

  @ApiProperty({ example: '2026-04' })
  @IsString()
  month: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  targetValue: number;
}

export class CreateKpiAssignmentDto {
  @ApiProperty({ example: '2026-04' })
  @IsString()
  month: string;

  @ApiProperty({ example: 'leads' })
  @IsString()
  metric: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  targetValue: number;

  @ApiProperty({ example: 'up' })
  @IsOptional()
  @IsString()
  direction?: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  assignedToId: number;
}

export class QueryKpiDto {
  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  metric?: string;
}
