import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { MarkTeacherAttendanceDto } from './dto/mark-teacher-attendance.dto';

@ApiTags('Attendance')
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('bulk')
  bulkMark(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.bulkMark(dto);
  }

  @Get('report')
  getReport(@CurrentBranch() branchId: number, @Query() query: QueryAttendanceDto) {
    return this.attendanceService.getReport(branchId, query);
  }

  @Get('student/:studentId')
  getStudentAttendance(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.attendanceService.getStudentAttendance(studentId, +month, +year);
  }

  @Get('group/:groupId')
  getGroupMonthlyAttendance(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.attendanceService.getGroupMonthlyAttendance(groupId, +month, +year);
  }

  @Get('teachers')
  getTeacherAttendance(
    @CurrentBranch() branchId: number,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.attendanceService.getTeacherAttendance(branchId, +month, +year);
  }

  @Post('teachers')
  markTeacherAttendance(@Body() dto: MarkTeacherAttendanceDto) {
    return this.attendanceService.markTeacherAttendance(dto);
  }

  @Get('teachers/:teacherId/schedule')
  getTeacherWorkSchedule(@Param('teacherId', ParseIntPipe) teacherId: number) {
    return this.attendanceService.getTeacherWorkSchedule(teacherId);
  }
}
