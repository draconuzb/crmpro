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
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Tags')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiOperation({ summary: 'List all tags for current branch' })
  findAll(@CurrentBranch() branchId: number) {
    return this.tagService.findAll(branchId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a tag' })
  create(@Body() dto: CreateTagDto, @CurrentBranch() branchId: number) {
    return this.tagService.create(branchId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTagDto) {
    return this.tagService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.remove(id);
  }
}
