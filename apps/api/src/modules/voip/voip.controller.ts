import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { VoipService } from './voip.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('VoIP')
@Controller('voip')
export class VoipController {
  constructor(private readonly voipService: VoipService) {}

  @Get('calls')
  @ApiBearerAuth()
  @ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get call history with filters' })
  getCalls(
    @CurrentBranch() branchId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('direction') direction?: string,
    @Query('studentId') studentId?: number,
  ) {
    return this.voipService.getCalls(branchId, {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      startDate,
      endDate,
      direction,
      studentId: studentId ? +studentId : undefined,
    });
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook for external VoIP system to create call records' })
  createCall(
    @Body()
    body: {
      studentId: number;
      phone: string;
      direction: string;
      duration?: number;
      recordingUrl?: string;
    },
  ) {
    return this.voipService.createCall(body);
  }
}
