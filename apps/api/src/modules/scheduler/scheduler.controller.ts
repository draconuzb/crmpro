import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulerService } from './scheduler.service';
import { CreateCronJobDto, UpdateCronJobDto } from './dto/create-cron-job.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Scheduler')
@ApiBearerAuth()
@Controller('scheduler')
@UseGuards(JwtAuthGuard)
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'List all cron jobs' })
  getJobs() {
    return this.schedulerService.getJobs();
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get cron job by ID' })
  getJob(@Param('id', ParseIntPipe) id: number) {
    return this.schedulerService.getJob(id);
  }

  @Post('jobs')
  @ApiOperation({ summary: 'Create cron job' })
  createJob(@Body() dto: CreateCronJobDto) {
    return this.schedulerService.createJob(dto);
  }

  @Patch('jobs/:id')
  @ApiOperation({ summary: 'Update cron job' })
  updateJob(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCronJobDto) {
    return this.schedulerService.updateJob(id, dto);
  }

  @Patch('jobs/:id/toggle')
  @ApiOperation({ summary: 'Toggle cron job enabled/disabled' })
  toggleJob(@Param('id', ParseIntPipe) id: number) {
    return this.schedulerService.toggleJob(id);
  }

  @Delete('jobs/:id')
  @ApiOperation({ summary: 'Delete cron job' })
  deleteJob(@Param('id', ParseIntPipe) id: number) {
    return this.schedulerService.deleteJob(id);
  }
}
