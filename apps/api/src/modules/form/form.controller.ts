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
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Forms')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('forms')
@UseGuards(JwtAuthGuard)
export class FormController {
  constructor(private readonly formService: FormService) {}

  @Get()
  findAll(@CurrentBranch() branchId: number) {
    return this.formService.findAll(branchId);
  }

  @Post()
  create(@CurrentBranch() branchId: number, @Body() dto: CreateFormDto) {
    return this.formService.create(branchId, dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateFormDto>) {
    return this.formService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.formService.delete(id);
  }
}
