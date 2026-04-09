import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiAnalyzeDto {
  @ApiProperty({ example: 'daily', enum: ['daily', 'weekly', 'monthly'] })
  @IsString()
  reportType: string;

  @ApiProperty({ example: '2026-04-01' })
  @IsString()
  startDate: string;

  @ApiProperty({ example: '2026-04-04' })
  @IsString()
  endDate: string;
}

export class AiAskDto {
  @ApiProperty({ example: 'Bu oyda leadlar soni qanday?' })
  @IsString()
  question: string;
}

export class AiAnomalyDto {
  @ApiProperty({ example: '2026-04-01' })
  @IsString()
  startDate: string;

  @ApiProperty({ example: '2026-04-04' })
  @IsString()
  endDate: string;
}
