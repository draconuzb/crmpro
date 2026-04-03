import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Students')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiOperation({ summary: 'List students for current branch' })
  findAll(
    @CurrentBranch() branchId: number,
    @Query() query: QueryStudentDto,
  ) {
    return this.studentService.findAll(branchId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a student' })
  create(
    @CurrentBranch() branchId: number,
    @Body() dto: CreateStudentDto,
  ) {
    return this.studentService.create(branchId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a student' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, dto);
  }

  @Get(':id/groups')
  @ApiOperation({ summary: 'Get student group enrollments' })
  getGroups(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.getGroups(id);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get student comments' })
  getComments(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.getComments(id);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to student' })
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body('text') text: string,
    @CurrentUser() user: any,
  ) {
    return this.studentService.addComment(id, user.id, text);
  }

  @Get(':id/calls')
  @ApiOperation({ summary: 'Get student call history' })
  getCallHistory(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.getCallHistory(id);
  }

  @Get(':id/sms')
  @ApiOperation({ summary: 'Get student SMS history' })
  getSmsHistory(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.getSmsHistory(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get student change history' })
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.getHistory(id);
  }

  @Get(':id/lead-history')
  @ApiOperation({ summary: 'Get student lead conversion history' })
  getLeadHistory(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.getLeadHistory(id);
  }

  @Post(':id/payments')
  @ApiOperation({ summary: 'Add payment for student' })
  addPayment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentBranch() branchId: number,
    @Body() body: { amount: number; method: string; description?: string },
  ) {
    return this.studentService.addPayment(id, branchId, body);
  }
}
