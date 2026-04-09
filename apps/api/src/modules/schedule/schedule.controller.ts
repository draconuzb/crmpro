import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  getSchedule(
    @CurrentBranch() branchId: number,
    @Query('dayType') dayType?: string,
  ) {
    return this.scheduleService.getSchedule(branchId, dayType);
  }
}
