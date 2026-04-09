import { IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDepartureDto {
  @ApiProperty()
  @IsInt()
  studentId: number;

  @ApiProperty()
  @IsInt()
  reasonId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  groupId?: number;
}

export class CreateLeadDeletionDto {
  @ApiProperty()
  @IsInt()
  leadId: number;

  @ApiProperty()
  @IsInt()
  reasonId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateRejectionReasonDto {
  @ApiProperty()
  @IsString()
  label: string;
}

export class QueryRejectionsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type?: string; // "sinov" | "doimiy"

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  reasonId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  teacherId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  courseId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  limit?: number;
}
