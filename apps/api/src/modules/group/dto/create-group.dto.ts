import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DayTypeEnum {
  ODD = 'ODD',
  EVEN = 'EVEN',
  OTHER = 'OTHER',
}

export class CreateGroupDto {
  @ApiProperty({ example: 'English B1 - Morning' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  courseId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  teacherId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roomId?: number;

  @ApiProperty({ enum: DayTypeEnum, example: DayTypeEnum.ODD })
  @IsEnum(DayTypeEnum)
  dayType: DayTypeEnum;

  @ApiPropertyOptional({ example: 'Mon,Wed,Fri' })
  @IsOptional()
  @IsString()
  customDays?: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '10:30' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: '2026-04-01' })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  capacity?: number;

  @ApiPropertyOptional({ example: 'Some note' })
  @IsOptional()
  @IsString()
  note?: string;
}
