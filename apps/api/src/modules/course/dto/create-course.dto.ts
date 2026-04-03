import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'English B1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 3, description: 'Duration in months' })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: 90, description: 'Lesson duration in minutes' })
  @IsNumber()
  @IsOptional()
  lessonDuration?: number;
}
