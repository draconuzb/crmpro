import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryStudentDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  courseId?: number;

  @ApiPropertyOptional({ description: 'Enrollment status: ACTIVE, FROZEN, LEFT, TRIAL' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ enum: ['debtor', 'paid', 'overpaid'] })
  @IsOptional()
  @IsIn(['debtor', 'paid', 'overpaid'])
  financialStatus?: 'debtor' | 'paid' | 'overpaid';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tagId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;
}
