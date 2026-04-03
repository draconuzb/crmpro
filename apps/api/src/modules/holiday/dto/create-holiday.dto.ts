import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateHolidayDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  date: string;
}
