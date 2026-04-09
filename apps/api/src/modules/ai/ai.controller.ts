import {
  Controller, Get, Post, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AiAnalyzeDto, AiAskDto, AiAnomalyDto } from './dto/ask-question.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('AI')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false })
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'AI report analysis' })
  analyze(@CurrentBranch() branchId: number, @Body() dto: AiAnalyzeDto) {
    return this.aiService.analyzeReport(branchId, dto.reportType, dto.startDate, dto.endDate);
  }

  @Post('anomalies')
  @ApiOperation({ summary: 'AI anomaly detection' })
  anomalies(@CurrentBranch() branchId: number, @Body() dto: AiAnomalyDto) {
    return this.aiService.detectAnomalies(branchId, dto.startDate, dto.endDate);
  }

  @Post('ask')
  @ApiOperation({ summary: 'AI question answering' })
  ask(@CurrentBranch() branchId: number, @Body() dto: AiAskDto) {
    return this.aiService.askQuestion(branchId, dto.question);
  }

  @Get('history')
  @ApiOperation({ summary: 'AI insights history' })
  history(
    @CurrentBranch() branchId: number,
    @Query('limit') limit?: string,
  ) {
    return this.aiService.getHistory(branchId, limit ? parseInt(limit) : 20);
  }
}
