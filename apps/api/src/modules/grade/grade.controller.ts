import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { GradeService } from './grade.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Grades')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('grade')
@UseGuards(JwtAuthGuard)
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Get('settings')
  getSettings(@CurrentBranch() branchId: number) {
    return this.gradeService.getSettings(branchId);
  }

  @Patch('settings')
  updateSettings(@CurrentBranch() branchId: number, @Body() body: any) {
    return this.gradeService.updateSettings(branchId, body);
  }

  @Get('group/:groupId')
  getGrades(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.gradeService.getGrades(groupId, month, year);
  }

  @Post('mark')
  setGrade(@Body() body: { groupId: number; studentId: number; date: string; score: number; comment?: string }) {
    return this.gradeService.setGrade(
      body.groupId,
      body.studentId,
      body.date,
      body.score,
      body.comment,
    );
  }
}
