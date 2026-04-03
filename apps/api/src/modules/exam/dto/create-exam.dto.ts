import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExamDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  groupId: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  date: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  maxScore: number;
}
