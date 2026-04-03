import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { CreateGroupDto } from './create-group.dto';

export enum GroupStatusEnum {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  COMPLETED = 'COMPLETED',
}

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  @IsOptional()
  @IsEnum(GroupStatusEnum)
  status?: GroupStatusEnum;
}
