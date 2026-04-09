import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateFormDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'JSON array of form field definitions' })
  fields: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
