import {
  Controller, Get, Post, Patch, Delete,
  Body, Query, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ProblemService } from './problem.service';
import { CreateProblemDto, UpdateProblemDto, QueryProblemDto } from './dto/create-problem.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Problems')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false })
@Controller('problems')
@UseGuards(JwtAuthGuard)
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get()
  @ApiOperation({ summary: 'List problems' })
  getProblems(@CurrentBranch() branchId: number, @Query() query: QueryProblemDto) {
    return this.problemService.getProblems(branchId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Report a problem' })
  createProblem(
    @CurrentBranch() branchId: number,
    @Body() dto: CreateProblemDto,
    @CurrentUser() user: any,
  ) {
    return this.problemService.createProblem(branchId, dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update problem' })
  updateProblem(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProblemDto) {
    return this.problemService.updateProblem(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete problem' })
  deleteProblem(@Param('id', ParseIntPipe) id: number) {
    return this.problemService.deleteProblem(id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Problem statistics' })
  getStats(@CurrentBranch() branchId: number) {
    return this.problemService.getStats(branchId);
  }
}
