import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { KpiService } from './kpi.service';
import { CreateKpiTargetDto, CreateKpiAssignmentDto, QueryKpiDto } from './dto/create-kpi-target.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('KPI')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false })
@Controller('kpi')
@UseGuards(JwtAuthGuard)
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  @Get('targets')
  @ApiOperation({ summary: 'List KPI targets' })
  getTargets(@CurrentBranch() branchId: number, @Query() query: QueryKpiDto) {
    return this.kpiService.getTargets(branchId, query);
  }

  @Post('targets')
  @ApiOperation({ summary: 'Create or update KPI target' })
  createTarget(@CurrentBranch() branchId: number, @Body() dto: CreateKpiTargetDto) {
    return this.kpiService.createTarget(branchId, dto);
  }

  @Delete('targets/:id')
  @ApiOperation({ summary: 'Delete KPI target' })
  deleteTarget(@Param('id', ParseIntPipe) id: number) {
    return this.kpiService.deleteTarget(id);
  }

  @Get('assignments')
  @ApiOperation({ summary: 'List KPI assignments' })
  getAssignments(@CurrentBranch() branchId: number, @Query() query: QueryKpiDto) {
    return this.kpiService.getAssignments(branchId, query);
  }

  @Post('assignments')
  @ApiOperation({ summary: 'Create or update KPI assignment' })
  createAssignment(
    @CurrentBranch() branchId: number,
    @Body() dto: CreateKpiAssignmentDto,
    @CurrentUser() user: any,
  ) {
    return this.kpiService.createAssignment(branchId, dto, user.id);
  }

  @Delete('assignments/:id')
  @ApiOperation({ summary: 'Delete KPI assignment' })
  deleteAssignment(@Param('id', ParseIntPipe) id: number) {
    return this.kpiService.deleteAssignment(id);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'KPI dashboard — target vs actual progress' })
  getDashboard(
    @CurrentBranch() branchId: number,
    @Query('month') month: string,
  ) {
    return this.kpiService.getDashboard(branchId, month);
  }
}
