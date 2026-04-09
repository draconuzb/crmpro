import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

// ═══ LEAD STAGES (separate route prefix to avoid :id conflict) ═══
@ApiTags('Lead Stages')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false })
@Controller('lead-stages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeadStageController {
  constructor(private readonly leadService: LeadService) {}

  @Get()
  @ApiOperation({ summary: 'Get configured lead stages for current branch' })
  getStages(@CurrentBranch() branchId: number) {
    return this.leadService.getStages(branchId);
  }

  @Post()
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Create a new lead stage' })
  createStage(
    @CurrentBranch() branchId: number,
    @Body() body: { key: string; label: string; color?: string },
  ) {
    return this.leadService.createStage(branchId, body);
  }

  @Patch(':id')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Update a lead stage' })
  updateStage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { label?: string; color?: string; sortOrder?: number },
  ) {
    return this.leadService.updateStage(id, body);
  }

  @Delete(':id')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Deactivate a lead stage' })
  deleteStage(@Param('id', ParseIntPipe) id: number) {
    return this.leadService.deleteStage(id);
  }

  @Post('reorder')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Reorder lead stages' })
  reorderStages(
    @CurrentBranch() branchId: number,
    @Body('stageIds') stageIds: number[],
  ) {
    return this.leadService.reorderStages(branchId, stageIds);
  }
}

// ═══ LEADS ═══
@ApiTags('Leads')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false })
@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Lead analytics: funnel, trends, sources, conversion rates' })
  getAnalytics(@CurrentBranch() branchId: number) {
    return this.leadService.getAnalytics(branchId);
  }

  @Get()
  @ApiOperation({ summary: 'List leads grouped by stage with course summary' })
  findAll(@CurrentBranch() branchId: number, @Query() query: QueryLeadDto) {
    return this.leadService.findAll(branchId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  create(@CurrentBranch() branchId: number, @Body() dto: CreateLeadDto) {
    return this.leadService.create(branchId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead detail' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentBranch() branchId: number) {
    return this.leadService.findOne(id, branchId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead' })
  update(@Param('id', ParseIntPipe) id: number, @CurrentBranch() branchId: number, @Body() dto: UpdateLeadDto) {
    return this.leadService.update(id, branchId, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Move lead between stages' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @CurrentBranch() branchId: number, @Body('status') status: string) {
    return this.leadService.updateStatus(id, branchId, status);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert lead to student and enroll in group' })
  convert(
    @Param('id', ParseIntPipe) id: number,
    @CurrentBranch() branchId: number,
    @Body('groupId') groupId?: number,
  ) {
    return this.leadService.convert(id, branchId, groupId);
  }

  @Post(':id/tags')
  @ApiOperation({ summary: 'Add tag to lead' })
  addTag(@Param('id', ParseIntPipe) id: number, @CurrentBranch() branchId: number, @Body('tagId') tagId: number) {
    return this.leadService.addTag(id, branchId, tagId);
  }

  @Delete(':id/tags/:tagId')
  @ApiOperation({ summary: 'Remove tag from lead' })
  removeTag(@Param('id', ParseIntPipe) id: number, @CurrentBranch() branchId: number, @Param('tagId', ParseIntPipe) tagId: number) {
    return this.leadService.removeTag(id, branchId, tagId);
  }
}
