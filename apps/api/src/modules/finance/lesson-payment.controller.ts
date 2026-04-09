import {
  Controller, Get, Post, Param, Body, Query,
  ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { LessonPaymentService } from './lesson-payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Lesson Payments')
@ApiBearerAuth()
@Controller('lesson-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonPaymentController {
  constructor(private readonly service: LessonPaymentService) {}

  @Post('run-daily')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Manually trigger daily lesson deduction (for testing)' })
  runDaily(@Body('date') date?: string) {
    return this.service.runDailyDeduction(date ? new Date(date) : undefined);
  }

  @Post(':id/write-off')
  @Roles('CEO', 'ADMIN', 'MANAGER')
  @ApiOperation({ summary: 'Write off a lesson payment (excused absence)' })
  writeOff(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @CurrentBranch() branchId: number,
    @Body('reason') reason?: string,
  ) {
    return this.service.writeOff(id, user.sub, branchId, reason);
  }

  @Post(':id/undo-write-off')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Undo a write-off' })
  undoWriteOff(
    @Param('id', ParseIntPipe) id: number,
    @CurrentBranch() branchId: number,
  ) {
    return this.service.undoWriteOff(id, branchId);
  }

  @Get('by-group/:groupId')
  @ApiOperation({ summary: 'Get lesson payments for a group' })
  getByGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('month') month?: string,
  ) {
    return this.service.getByGroup(groupId, month);
  }

  @Get('by-student/:studentId')
  @ApiOperation({ summary: 'Get lesson payments for a student' })
  getByStudent(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query('month') month?: string,
  ) {
    return this.service.getByStudent(studentId, month);
  }

  @Get('teacher-salary/:teacherId')
  @ApiOperation({ summary: 'Calculate teacher salary for a month' })
  getTeacherSalary(
    @Param('teacherId', ParseIntPipe) teacherId: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.service.calculateTeacherSalary(teacherId, month, year);
  }
}
