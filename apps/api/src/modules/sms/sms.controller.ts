import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('SMS')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('sms')
@UseGuards(JwtAuthGuard)
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send SMS to a student' })
  send(@Body() body: { studentId: number; message: string }) {
    return this.smsService.sendSms(body.studentId, body.message);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Send SMS to multiple students' })
  bulkSend(@Body() body: { studentIds: number[]; message: string }) {
    return this.smsService.bulkSend(body.studentIds, body.message);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get SMS history with filters' })
  getHistory(
    @CurrentBranch() branchId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('studentId') studentId?: number,
  ) {
    return this.smsService.getHistory(branchId, {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      startDate,
      endDate,
      studentId: studentId ? +studentId : undefined,
    });
  }
}
