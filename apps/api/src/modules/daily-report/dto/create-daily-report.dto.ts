import { IsString, IsOptional, IsObject, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDailyReportDto {
  @ApiProperty({ example: '2026-04-04' })
  @IsString()
  date: string;

  @ApiProperty({ example: 'leads' })
  @IsString()
  section: string;

  @ApiProperty({ example: { count: 5, subject: 'English' } })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({ example: 'bot' })
  @IsOptional()
  @IsString()
  source?: string;
}

export class QueryDailyReportDto {
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsString() section?: string;
  @IsOptional() @IsString() source?: string;
}
