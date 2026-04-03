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
import { ApiTags, ApiBearerAuth, ApiHeader, ApiOperation } from '@nestjs/swagger';
import { ReminderService } from './reminder.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reminders')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Get()
  @ApiOperation({ summary: 'List reminders grouped by overdue/today/future' })
  findAll(@CurrentBranch() branchId: number) {
    return this.reminderService.findAll(branchId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a reminder' })
  create(
    @CurrentBranch() branchId: number,
    @CurrentUser() user: any,
    @Body() dto: CreateReminderDto,
  ) {
    return this.reminderService.create(branchId, dto, user.id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark reminder as completed' })
  complete(
    @Param('id', ParseIntPipe) id: number,
    @Body('note') note?: string,
  ) {
    return this.reminderService.complete(id, note);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reminder' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reminderService.delete(id);
  }
}
