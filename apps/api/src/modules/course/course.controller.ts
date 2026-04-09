import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateSubcourseDto } from './dto/create-subcourse.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Courses')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  @ApiOperation({ summary: 'List all courses for current branch' })
  findAll(@CurrentBranch() branchId: number) {
    return this.courseService.findAll(branchId);
  }

  @Post()
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Create a course' })
  create(@Body() dto: CreateCourseDto, @CurrentBranch() branchId: number) {
    return this.courseService.create(branchId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Update a course' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCourseDto) {
    return this.courseService.update(id, dto);
  }

  @Delete(':id')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Soft delete a course' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.remove(id);
  }

  @Post(':id/subcourses')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Add subcourse to a course' })
  addSubcourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSubcourseDto,
  ) {
    return this.courseService.addSubcourse(id, dto);
  }

  @Patch('subcourses/:id')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Update a subcourse' })
  updateSubcourse(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSubcourseDto,
  ) {
    return this.courseService.updateSubcourse(id, dto);
  }

  @Delete('subcourses/:id')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Delete a subcourse' })
  removeSubcourse(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.removeSubcourse(id);
  }
}
