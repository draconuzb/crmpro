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
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddStudentToGroupDto } from './dto/add-student-to-group.dto';
import { QueryGroupDto } from './dto/query-group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Groups')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @ApiOperation({ summary: 'List groups for current branch' })
  findAll(
    @CurrentBranch() branchId: number,
    @Query() query: QueryGroupDto,
  ) {
    return this.groupService.findAll(branchId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a group' })
  create(@CurrentBranch() branchId: number, @Body() dto: CreateGroupDto) {
    return this.groupService.create(branchId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a group' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groupService.update(id, dto);
  }

  @Post(':id/students')
  @ApiOperation({ summary: 'Add student to group' })
  addStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddStudentToGroupDto,
  ) {
    return this.groupService.addStudent(id, dto);
  }

  @Delete(':id/students/:studentId')
  @ApiOperation({ summary: 'Remove student from group' })
  removeStudent(
    @Param('id', ParseIntPipe) id: number,
    @Param('studentId', ParseIntPipe) studentId: number,
  ) {
    return this.groupService.removeStudent(id, studentId);
  }

  @Get(':id/attendance')
  @ApiOperation({ summary: 'Get group attendance for a month' })
  getAttendance(
    @Param('id', ParseIntPipe) id: number,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const y = parseInt(year, 10) || new Date().getFullYear();
    return this.groupService.getAttendance(id, m, y);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Get group students' })
  getStudents(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.getStudents(id);
  }
}
