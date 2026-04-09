import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Dashboard statistics' })
  getDashboardStats(@CurrentBranch() branchId: number) {
    return this.reportService.getDashboardStats(branchId);
  }

  @Get('dashboard/revenue')
  @ApiOperation({ summary: 'Monthly revenue chart data' })
  getDashboardRevenue(
    @CurrentBranch() branchId: number,
    @Query('months') months?: string,
  ) {
    return this.reportService.getRevenueChart(branchId, months ? parseInt(months, 10) : 12);
  }

  @Get('conversion')
  @ApiOperation({ summary: 'Lead conversion funnel report' })
  getConversion(
    @CurrentBranch() branchId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('source') source?: string,
    @Query('staffId') staffId?: string,
  ) {
    return this.reportService.getConversionReport(
      branchId,
      startDate,
      endDate,
      source,
      staffId ? parseInt(staffId, 10) : undefined,
    );
  }

  @Get('students-left')
  @ApiOperation({ summary: 'Students who left active groups' })
  getStudentsLeft(@CurrentBranch() branchId: number) {
    return this.reportService.getStudentsLeft(branchId);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Audit logs (paginated)' })
  getLogs(
    @CurrentBranch() branchId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportService.getLogs(
      branchId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('attendance')
  @ApiOperation({ summary: 'Attendance analytics report' })
  getAttendance(
    @CurrentBranch() branchId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupId') groupId?: string,
  ) {
    return this.reportService.getAttendance(
      branchId,
      startDate,
      endDate,
      groupId ? parseInt(groupId, 10) : undefined,
    );
  }

  @Get('leads')
  @ApiOperation({ summary: 'Leads analytics report' })
  getLeads(
    @CurrentBranch() branchId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('source') source?: string,
  ) {
    return this.reportService.getLeads(branchId, startDate, endDate, source);
  }
}
