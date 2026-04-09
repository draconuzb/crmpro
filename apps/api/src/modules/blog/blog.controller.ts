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
import { ApiTags, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Blog')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('blog')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  findAll(@CurrentBranch() branchId: number) {
    return this.blogService.findAll(branchId);
  }

  @Post()
  @Roles('CEO', 'ADMIN')
  create(@CurrentBranch() branchId: number, @Body() dto: CreateBlogDto) {
    return this.blogService.create(branchId, dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.findOne(id);
  }

  @Patch(':id')
  @Roles('CEO', 'ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateBlogDto>) {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @Roles('CEO', 'ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.delete(id);
  }
}
