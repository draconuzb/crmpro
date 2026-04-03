import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty({ example: 'Ali Valiyev' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'teacher' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: "Ingliz tili o'qituvchisi" })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateStaffDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsString() subject?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() notes?: string;
}

export class CreateGoalDto {
  @ApiProperty({ example: "Yangi o'qituvchi topish" })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deadline?: string;
}

export class UpdateGoalDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() subject?: string;
  @IsOptional() @IsString() deadline?: string;
  @IsOptional() @IsString() status?: string;
}

export class QueryStaffDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() search?: string;
}

export class QueryGoalDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() category?: string;
}
