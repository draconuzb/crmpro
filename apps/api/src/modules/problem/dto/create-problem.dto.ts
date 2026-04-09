import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProblemDto {
  @ApiProperty({ example: 'equipment' })
  @IsString()
  type: string;

  @ApiProperty({ example: "2-xona projektorida muammo bor" })
  @IsString()
  issue: string;
}

export class UpdateProblemDto {
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() issue?: string;
  @IsOptional() @IsString() status?: string;
}

export class QueryProblemDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() search?: string;
}
