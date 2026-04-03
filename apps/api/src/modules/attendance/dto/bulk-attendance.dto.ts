import { IsNumber, IsString, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AttendanceRecordDto {
  @ApiProperty() @IsNumber() studentId: number;
  @ApiProperty({ enum: ['PRESENT', 'ABSENT', 'LATE'] }) @IsEnum(['PRESENT', 'ABSENT', 'LATE']) status: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() note?: string;
}

export class BulkAttendanceDto {
  @ApiProperty() @IsNumber() groupId: number;
  @ApiProperty() @IsString() date: string;
  @ApiProperty({ type: [AttendanceRecordDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => AttendanceRecordDto) records: AttendanceRecordDto[];
}
