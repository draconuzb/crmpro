import {
  Controller, Get, Post, Delete,
  Body, Query, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { DailyReportService } from './daily-report.service';
import { CreateDailyReportDto, QueryDailyReportDto } from './dto/create-daily-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Daily Reports')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false })
@Controller('daily-reports')
@UseGuards(JwtAuthGuard)
export class DailyReportController {
  constructor(private readonly dailyReportService: DailyReportService) {}

  @Get()
  @ApiOperation({ summary: 'List daily reports' })
  getReports(@CurrentBranch() branchId: number, @Query() query: QueryDailyReportDto) {
    return this.dailyReportService.getReports(branchId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create daily report entry' })
  createReport(
    @CurrentBranch() branchId: number,
    @Body() dto: CreateDailyReportDto,
    @CurrentUser() user: any,
  ) {
    return this.dailyReportService.createReport(branchId, dto, user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Daily summary — all sections for a date' })
  getSummary(
    @CurrentBranch() branchId: number,
    @Query('date') date: string,
  ) {
    return this.dailyReportService.getSummary(branchId, date);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete daily report entry' })
  deleteReport(@Param('id', ParseIntPipe) id: number) {
    return this.dailyReportService.deleteReport(id);
  }
}
