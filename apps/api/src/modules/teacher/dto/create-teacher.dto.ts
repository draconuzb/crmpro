import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsArray,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTeacherDto {
  @ApiProperty({ example: 'Ali' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Valiyev' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Array of course IDs the teacher specializes in',
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  courseIds?: number[];

  @ApiPropertyOptional({ example: 'fixed', description: 'Salary type: "fixed" or "percentage"' })
  @IsOptional()
  @IsString()
  salaryType?: string;

  @ApiPropertyOptional({ example: 175000, description: 'Fixed amount per student OR percentage (e.g. 50)' })
  @IsOptional()
  @Type(() => Number)
  salaryAmount?: number;
}
