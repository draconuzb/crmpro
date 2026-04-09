import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { OnlineLessonService } from './online-lesson.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Online Lessons')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false })
@Controller('online-lessons')
@UseGuards(JwtAuthGuard)
export class OnlineLessonController {
  constructor(private readonly service: OnlineLessonService) {}

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming online lessons for current branch' })
  getUpcoming(@CurrentBranch() branchId: number) {
    return this.service.getUpcoming(branchId);
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Get online lessons for a group' })
  getByGroup(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.service.getByGroup(groupId);
  }

  @Post('group/:groupId')
  @ApiOperation({ summary: 'Create an online lesson for a group' })
  create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() body: { title: string; url: string; date: string },
  ) {
    return this.service.create(groupId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an online lesson' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { title?: string; url?: string; date?: string },
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an online lesson' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
