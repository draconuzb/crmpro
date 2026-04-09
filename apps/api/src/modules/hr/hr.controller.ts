import {
  Controller, Get, Post, Patch, Delete,
  Body, Query, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { HrService } from './hr.service';
import {
  CreateStaffDto, UpdateStaffDto,
  CreateGoalDto, UpdateGoalDto,
  QueryStaffDto, QueryGoalDto,
} from './dto/create-staff.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('HR')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false })
@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  // ─── STAFF ──────────────────────────────────────────────────────

  @Get('staff')
  @ApiOperation({ summary: 'List HR staff' })
  getStaff(@CurrentBranch() branchId: number, @Query() query: QueryStaffDto) {
    return this.hrService.getStaff(branchId, query);
  }

  @Post('staff')
  @ApiOperation({ summary: 'Add new staff member' })
  createStaff(@CurrentBranch() branchId: number, @Body() dto: CreateStaffDto) {
    return this.hrService.createStaff(branchId, dto);
  }

  @Patch('staff/:id')
  @ApiOperation({ summary: 'Update staff member' })
  updateStaff(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStaffDto) {
    return this.hrService.updateStaff(id, dto);
  }

  @Delete('staff/:id')
  @ApiOperation({ summary: 'Delete staff member' })
  deleteStaff(@Param('id', ParseIntPipe) id: number) {
    return this.hrService.deleteStaff(id);
  }

  @Get('staff/stats')
  @ApiOperation({ summary: 'Staff statistics' })
  getStaffStats(@CurrentBranch() branchId: number) {
    return this.hrService.getStaffStats(branchId);
  }

  // ─── GOALS ──────────────────────────────────────────────────────

  @Get('goals')
  @ApiOperation({ summary: 'List HR goals' })
  getGoals(@CurrentBranch() branchId: number, @Query() query: QueryGoalDto) {
    return this.hrService.getGoals(branchId, query);
  }

  @Post('goals')
  @ApiOperation({ summary: 'Create goal' })
  createGoal(@CurrentBranch() branchId: number, @Body() dto: CreateGoalDto) {
    return this.hrService.createGoal(branchId, dto);
  }

  @Patch('goals/:id')
  @ApiOperation({ summary: 'Update goal' })
  updateGoal(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGoalDto) {
    return this.hrService.updateGoal(id, dto);
  }

  @Delete('goals/:id')
  @ApiOperation({ summary: 'Delete goal' })
  deleteGoal(@Param('id', ParseIntPipe) id: number) {
    return this.hrService.deleteGoal(id);
  }
}
