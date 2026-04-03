import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLeadDto } from './create-lead.dto';

export enum LeadStatusEnum {
  LEAD = 'LEAD',
  EXPECTATION = 'EXPECTATION',
  SET = 'SET',
}

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @ApiPropertyOptional({ enum: LeadStatusEnum })
  @IsOptional()
  @IsEnum(LeadStatusEnum)
  status?: LeadStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignedToId?: number;
}
