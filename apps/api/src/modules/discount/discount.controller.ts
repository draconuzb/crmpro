import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { DiscountService } from './discount.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Discounts')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false })
@Controller('discounts')
@UseGuards(JwtAuthGuard)
export class DiscountController {
  constructor(private readonly service: DiscountService) {}

  @Get()
  @ApiOperation({ summary: 'Get all discounts for current branch' })
  getAll(@CurrentBranch() branchId: number) {
    return this.service.getAll(branchId);
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Get discounts for a group' })
  getByGroup(@Param('groupId', ParseIntPipe) groupId: number) {
    return this.service.getByGroup(groupId);
  }

  @Post('group/:groupId')
  @ApiOperation({ summary: 'Create a discount for a group' })
  create(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() body: { name: string; percentage?: number; fixedAmount?: number },
  ) {
    return this.service.create(groupId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a discount' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; percentage?: number; fixedAmount?: number; isActive?: boolean },
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a discount' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
