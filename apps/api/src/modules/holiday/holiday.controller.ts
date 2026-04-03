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
import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Holidays')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('holidays')
@UseGuards(JwtAuthGuard)
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Get()
  findAll(@CurrentBranch() branchId: number) {
    return this.holidayService.findAll(branchId);
  }

  @Post()
  create(@CurrentBranch() branchId: number, @Body() dto: CreateHolidayDto) {
    return this.holidayService.create(branchId, dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateHolidayDto) {
    return this.holidayService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.holidayService.delete(id);
  }
}
