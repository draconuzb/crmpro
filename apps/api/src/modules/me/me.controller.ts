import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MeService } from './me.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Me (Student & Teacher Portal)')
@ApiBearerAuth()
@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  // ─── STUDENT ENDPOINTS ──────────────────────────────────────

  @Get('student/dashboard')
  @ApiOperation({ summary: 'Student dashboard — balance, coins, schedule, grades' })
  studentDashboard(@CurrentUser() user: any) {
    return this.meService.getStudentDashboard(user.sub);
  }

  @Get('student/profile')
  @ApiOperation({ summary: 'Student profile' })
  studentProfile(@CurrentUser() user: any) {
    return this.meService.getStudentProfile(user.sub);
  }

  @Get('student/groups')
  @ApiOperation({ summary: 'Student enrolled groups' })
  studentGroups(@CurrentUser() user: any) {
    return this.meService.getStudentGroups(user.sub);
  }

  @Get('student/schedule')
  @ApiOperation({ summary: 'Student weekly schedule' })
  studentSchedule(@CurrentUser() user: any) {
    return this.meService.getStudentSchedule(user.sub);
  }

  @Get('student/grades')
  @ApiOperation({ summary: 'Student grades history' })
  studentGrades(@CurrentUser() user: any) {
    return this.meService.getStudentGrades(user.sub);
  }

  @Get('student/attendance')
  @ApiOperation({ summary: 'Student attendance history' })
  studentAttendance(@CurrentUser() user: any) {
    return this.meService.getStudentAttendance(user.sub);
  }

  @Get('student/payments')
  @ApiOperation({ summary: 'Student payment history & balance' })
  studentPayments(@CurrentUser() user: any) {
    return this.meService.getStudentPayments(user.sub);
  }

  // ─── TEACHER ENDPOINTS ──────────────────────────────────────

  @Get('teacher/dashboard')
  @ApiOperation({ summary: 'Teacher dashboard — groups, schedule, attendance' })
  teacherDashboard(@CurrentUser() user: any) {
    return this.meService.getTeacherDashboard(user.sub);
  }

  @Get('teacher/profile')
  @ApiOperation({ summary: 'Teacher profile' })
  teacherProfile(@CurrentUser() user: any) {
    return this.meService.getTeacherProfile(user.sub);
  }

  @Get('teacher/groups')
  @ApiOperation({ summary: 'Teacher assigned groups' })
  teacherGroups(@CurrentUser() user: any) {
    return this.meService.getTeacherGroups(user.sub);
  }

  @Get('teacher/groups/:groupId')
  @ApiOperation({ summary: 'Teacher group detail with students' })
  teacherGroupDetail(
    @CurrentUser() user: any,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.meService.getTeacherGroupDetail(user.sub, groupId);
  }

  @Get('teacher/salary')
  @ApiOperation({ summary: 'Teacher salary for month' })
  teacherSalary(
    @CurrentUser() user: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    const y = year ? parseInt(year) : new Date().getFullYear();
    return this.meService.getTeacherSalary(user.sub, m, y);
  }
}
