import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitResultDto } from './dto/submit-result.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Exams')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get()
  findAll(@Query('groupId', ParseIntPipe) groupId: number) {
    return this.examService.findAll(groupId);
  }

  @Post()
  create(@Body() dto: CreateExamDto) {
    return this.examService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.examService.findOne(id);
  }

  @Post(':id/results')
  submitResult(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitResultDto,
  ) {
    return this.examService.submitResult(id, dto);
  }

  @Post(':id/results/bulk')
  submitBulkResults(
    @Param('id', ParseIntPipe) id: number,
    @Body('results') results: SubmitResultDto[],
  ) {
    return this.examService.submitBulkResults(id, results);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.examService.delete(id);
  }
}
