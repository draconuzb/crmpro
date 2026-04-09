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
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Teachers')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CEO', 'ADMIN')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get()
  @ApiOperation({ summary: 'List teachers for current branch' })
  findAll(@CurrentBranch() branchId: number, @Query() query: PaginationDto) {
    return this.teacherService.findAll(branchId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a teacher' })
  create(
    @CurrentBranch() branchId: number,
    @Body() dto: CreateTeacherDto,
  ) {
    return this.teacherService.create(branchId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get teacher detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a teacher' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeacherDto,
  ) {
    return this.teacherService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a teacher' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.remove(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get teacher history logs' })
  getHistory(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.getHistory(id);
  }

  @Get(':id/salary')
  @ApiOperation({ summary: 'Get teacher salary for a month' })
  getSalary(
    @Param('id', ParseIntPipe) id: number,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const m = parseInt(month, 10) || new Date().getMonth() + 1;
    const y = parseInt(year, 10) || new Date().getFullYear();
    return this.teacherService.getSalary(id, m, y);
  }
}
