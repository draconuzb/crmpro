import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';

@ApiTags('Gamification')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('gamification')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  // ─── PRODUCTS ──────────────────────────────────────────────────────

  @Get('products')
  @ApiOperation({ summary: 'List active products for branch' })
  getProducts(@CurrentBranch() branchId: number) {
    return this.gamificationService.getProducts(branchId);
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a product' })
  createProduct(
    @CurrentBranch() branchId: number,
    @Body() dto: CreateProductDto,
  ) {
    return this.gamificationService.createProduct(branchId, dto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update a product' })
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    return this.gamificationService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @Roles('CEO', 'ADMIN')
  @ApiOperation({ summary: 'Soft-delete a product' })
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.gamificationService.deleteProduct(id);
  }

  // ─── ORDERS ────────────────────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: 'List orders with filters' })
  getOrders(
    @CurrentBranch() branchId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.gamificationService.getOrders(branchId, {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      search,
      status,
      startDate,
      endDate,
    });
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create an order (purchase product with coins)' })
  createOrder(
    @CurrentBranch() branchId: number,
    @Body() dto: CreateOrderDto,
  ) {
    return this.gamificationService.createOrder(branchId, dto);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Update order status' })
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.gamificationService.updateOrderStatus(id, status);
  }
}
