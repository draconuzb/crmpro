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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Branches')
@ApiBearerAuth()
@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get()
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'List all branches' })
  findAll() {
    return this.branchService.findAll();
  }

  @Post()
  @Roles('CEO')
  @ApiOperation({ summary: 'Create a new branch' })
  create(@Body() dto: CreateBranchDto) {
    return this.branchService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.branchService.findOne(id);
  }

  @Patch(':id')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Update a branch' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.branchService.update(id, dto);
  }

  @Delete(':id')
  @Roles('CEO')
  @ApiOperation({ summary: 'Soft delete a branch' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.branchService.remove(id);
  }

  @Get(':id/users')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Get users assigned to a branch' })
  getUsers(@Param('id', ParseIntPipe) id: number) {
    return this.branchService.getBranchUsers(id);
  }

  @Post(':id/users')
  @Roles('CEO')
  @ApiOperation({ summary: 'Assign user to branch' })
  addUser(@Param('id', ParseIntPipe) branchId: number, @Body('userId') userId: number) {
    return this.branchService.addUserToBranch(branchId, userId);
  }

  @Delete(':id/users/:userId')
  @Roles('CEO')
  @ApiOperation({ summary: 'Remove user from branch' })
  removeUser(@Param('id', ParseIntPipe) branchId: number, @Param('userId', ParseIntPipe) userId: number) {
    return this.branchService.removeUserFromBranch(branchId, userId);
  }
}
