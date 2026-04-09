import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, MaxLength } from 'class-validator';

export class CreateHolidayDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  date: string;
}
