import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AddStudentToGroupDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  studentId: number;

  @ApiProperty({ example: 500000 })
  @Type(() => Number)
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;
}
