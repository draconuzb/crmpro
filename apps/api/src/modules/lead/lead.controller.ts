import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Leads')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get()
  @ApiOperation({ summary: 'List leads for current branch (grouped by status)' })
  findAll(
    @CurrentBranch() branchId: number,
    @Query() query: QueryLeadDto,
  ) {
    return this.leadService.findAll(branchId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  create(
    @CurrentBranch() branchId: number,
    @Body() dto: CreateLeadDto,
  ) {
    return this.leadService.create(branchId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leadService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update lead status (move between Kanban columns)' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.leadService.updateStatus(id, status);
  }

  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert lead to student' })
  convert(
    @Param('id', ParseIntPipe) id: number,
    @CurrentBranch() branchId: number,
  ) {
    return this.leadService.convert(id, branchId);
  }

  @Post(':id/tags')
  @ApiOperation({ summary: 'Add tag to lead' })
  addTag(
    @Param('id', ParseIntPipe) id: number,
    @Body('tagId') tagId: number,
  ) {
    return this.leadService.addTag(id, tagId);
  }

  @Delete(':id/tags/:tagId')
  @ApiOperation({ summary: 'Remove tag from lead' })
  removeTag(
    @Param('id', ParseIntPipe) id: number,
    @Param('tagId', ParseIntPipe) tagId: number,
  ) {
    return this.leadService.removeTag(id, tagId);
  }
}
