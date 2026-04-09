import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCronJobDto {
  @ApiProperty({ example: 'custom_reminder' })
  @IsString()
  key: string;

  @ApiProperty({ example: "Kunlik eslatma" })
  @IsString()
  label: string;

  @ApiProperty({ example: '0 18 * * 1-6' })
  @IsString()
  schedule: string;

  @ApiPropertyOptional({ example: 'message' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: "Ma'lumotlarni kiritishni unutmang!" })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ example: 'leads,finance' })
  @IsOptional()
  @IsString()
  sections?: string;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  assignedTo?: number[];

  @IsOptional()
  branchId?: number;
}

export class UpdateCronJobDto {
  @IsOptional() @IsString() label?: string;
  @IsOptional() @IsString() schedule?: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() message?: string;
  @IsOptional() @IsString() sections?: string;
  @IsOptional() @IsArray() assignedTo?: number[];
}
