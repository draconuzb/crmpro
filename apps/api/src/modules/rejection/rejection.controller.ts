import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { RejectionService } from './rejection.service';
import {
  CreateStudentDepartureDto,
  CreateLeadDeletionDto,
  CreateRejectionReasonDto,
  QueryRejectionsDto,
} from './dto/create-departure.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Rejections')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false })
@Controller('rejections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RejectionController {
  constructor(private readonly service: RejectionService) {}

  // ── Rejection Reasons ──

  @Get('reasons')
  @ApiOperation({ summary: 'Get configurable rejection reasons for branch' })
  getReasons(@CurrentBranch() branchId: number) {
    return this.service.getReasons(branchId);
  }

  @Post('reasons')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Create a rejection reason' })
  createReason(@CurrentBranch() branchId: number, @Body() dto: CreateRejectionReasonDto) {
    return this.service.createReason(branchId, dto);
  }

  @Patch('reasons/:id')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Update a rejection reason' })
  updateReason(@Param('id', ParseIntPipe) id: number, @Body('label') label: string) {
    return this.service.updateReason(id, label);
  }

  @Delete('reasons/:id')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Deactivate a rejection reason' })
  deleteReason(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteReason(id);
  }

  // ── Student Departures (Rad etganlar) ──

  @Get('departures')
  @ApiOperation({ summary: 'List student departures with filters (Rad etganlar page)' })
  getDepartures(@CurrentBranch() branchId: number, @Query() query: QueryRejectionsDto) {
    return this.service.getDepartures(branchId, query);
  }

  @Post('departures')
  @ApiOperation({ summary: 'Record a student departure (archive student with reason)' })
  createDeparture(
    @CurrentBranch() branchId: number,
    @Body() dto: CreateStudentDepartureDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createDeparture(branchId, dto, user.sub);
  }

  // ── Lead Deletions ──

  @Post('lead-delete')
  @ApiOperation({ summary: 'Delete a lead with reason (workflow from Kanban)' })
  deleteLeadWithReason(
    @CurrentBranch() branchId: number,
    @Body() dto: CreateLeadDeletionDto,
    @CurrentUser() user: any,
  ) {
    return this.service.deleteLeadWithReason(branchId, dto, user.sub);
  }

  @Get('lead-deletions')
  @ApiOperation({ summary: 'List deleted leads with reasons' })
  getLeadDeletions(@CurrentBranch() branchId: number, @Query() query: QueryRejectionsDto) {
    return this.service.getLeadDeletions(branchId, query);
  }
}
