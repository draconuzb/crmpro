import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID (omit for all branches)' })
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'CEO Dashboard overview — finance, leads, attendance, problems, rooms by period' })
  getDashboardOverview(
    @CurrentBranch() branchId: number,
    @Query('month') month?: string,
    @Query('quarter') quarter?: string,
    @Query('range') range?: string,
    @Query('year') year?: string,
    @Query('branch_id') queryBranchId?: string,
  ) {
    // Query param branch_id overrides header for analytics filtering
    const effectiveBranchId = queryBranchId ? parseInt(queryBranchId, 10) : branchId;
    return this.analyticsService.getDashboardOverview({ month, quarter, range, year, branchId: effectiveBranchId || undefined });
  }

  @Get('branch-trends')
  @ApiOperation({ summary: 'Single branch trends — monthly revenue, leads, attendance, debtors with period comparison' })
  getBranchTrends(
    @CurrentBranch() branchId: number,
    @Query('month') month?: string,
    @Query('quarter') quarter?: string,
    @Query('range') range?: string,
    @Query('year') year?: string,
    @Query('branch_id') queryBranchId?: string,
  ) {
    const effectiveBranchId = queryBranchId ? parseInt(queryBranchId, 10) : branchId;
    return this.analyticsService.getBranchTrends({ month, quarter, range, year, branchId: effectiveBranchId || undefined });
  }

  @Get('branch-compare')
  @ApiOperation({ summary: 'All branches comparison — ranking with composite scores' })
  getBranchComparison(
    @Query('month') month?: string,
    @Query('quarter') quarter?: string,
    @Query('range') range?: string,
    @Query('year') year?: string,
  ) {
    return this.analyticsService.getBranchComparison({ month, quarter, range, year });
  }

  @Get('att-trend')
  @ApiOperation({ summary: 'Attendance trend — single or multi-branch over time' })
  getAttendanceTrend(
    @CurrentBranch() branchId: number,
    @Query('month') month?: string,
    @Query('quarter') quarter?: string,
    @Query('range') range?: string,
    @Query('year') year?: string,
    @Query('branch_id') queryBranchId?: string,
  ) {
    const effectiveBranchId = queryBranchId ? parseInt(queryBranchId, 10) : branchId;
    return this.analyticsService.getAttendanceTrend({ month, quarter, range, year, branchId: effectiveBranchId || undefined });
  }

  @Get('financial-intelligence')
  @ApiOperation({ summary: 'Financial intelligence — expenses, debtors, cash flow, break-even, room potential' })
  getFinancialIntelligence(
    @CurrentBranch() branchId: number,
    @Query('month') month?: string,
    @Query('quarter') quarter?: string,
    @Query('range') range?: string,
    @Query('year') year?: string,
    @Query('branch_id') queryBranchId?: string,
  ) {
    const effectiveBranchId = queryBranchId ? parseInt(queryBranchId, 10) : branchId;
    return this.analyticsService.getFinancialIntelligence({ month, quarter, range, year, branchId: effectiveBranchId || undefined });
  }

  @Get('activity-feed')
  @ApiOperation({ summary: 'Recent activity feed across all sections' })
  getActivityFeed(@CurrentBranch() branchId: number, @Query('limit') limit?: string) {
    return this.analyticsService.getActivityFeed(branchId || undefined, limit ? parseInt(limit, 10) : 20);
  }

  @Get('hr-analytics')
  @ApiOperation({ summary: 'HR analytics — staff counts, categories, monthly hires, by branch' })
  getHrAnalytics(@CurrentBranch() branchId: number) {
    return this.analyticsService.getHrAnalytics(branchId || undefined);
  }

  @Get('manager-accountability')
  @ApiOperation({ summary: 'Manager activity tracking — who did what this period' })
  getManagerAccountability(
    @CurrentBranch() branchId: number,
    @Query('month') month?: string,
    @Query('quarter') quarter?: string,
    @Query('range') range?: string,
    @Query('year') year?: string,
    @Query('branch_id') queryBranchId?: string,
  ) {
    const effectiveBranchId = queryBranchId ? parseInt(queryBranchId, 10) : branchId;
    return this.analyticsService.getManagerAccountability({ month, quarter, range, year, branchId: effectiveBranchId || undefined });
  }
}
