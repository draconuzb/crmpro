import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Ratings')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get()
  @ApiOperation({ summary: 'Get student ratings with optional filters' })
  getRatings(
    @CurrentBranch() branchId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupId') groupId?: string,
  ) {
    return this.ratingService.getRatings(
      branchId,
      startDate,
      endDate,
      groupId ? parseInt(groupId, 10) : undefined,
    );
  }

  @Get('chart')
  @ApiOperation({ summary: 'Get rating chart data' })
  getChartData(
    @CurrentBranch() branchId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ratingService.getChartData(branchId, startDate, endDate);
  }
}
