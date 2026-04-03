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
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Rooms')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  @ApiOperation({ summary: 'List all rooms for current branch' })
  findAll(@CurrentBranch() branchId: number) {
    return this.roomService.findAll(branchId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a room' })
  create(@Body() dto: CreateRoomDto, @CurrentBranch() branchId: number) {
    return this.roomService.create(branchId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room detail' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a room' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomDto) {
    return this.roomService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a room' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.remove(id);
  }
}
