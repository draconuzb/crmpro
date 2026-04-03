import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { QueryFinanceDto } from './dto/query-finance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentBranch } from '../../common/decorators/current-branch.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Finance')
@ApiBearerAuth()
@ApiHeader({ name: 'x-branch-id', required: false, description: 'Branch ID' })
@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ─── PAYMENTS ──────────────────────────────────────────────────────

  @Get('payments')
  @ApiOperation({ summary: 'List payments with filters' })
  getPayments(
    @CurrentBranch() branchId: number,
    @Query() query: QueryFinanceDto,
  ) {
    return this.financeService.getPayments(branchId, query);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Create a payment' })
  createPayment(
    @CurrentBranch() branchId: number,
    @Body() dto: CreatePaymentDto,
    @CurrentUser() user: any,
  ) {
    return this.financeService.createPayment(branchId, dto, user.id);
  }

  @Get('payments/summary')
  @ApiOperation({ summary: 'Revenue summary with chart data' })
  getPaymentsSummary(
    @CurrentBranch() branchId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getPaymentsSummary(branchId, startDate, endDate);
  }

  // ─── WITHDRAWALS ───────────────────────────────────────────────────

  @Get('withdrawals')
  @ApiOperation({ summary: 'List withdrawals with filters' })
  getWithdrawals(
    @CurrentBranch() branchId: number,
    @Query() query: QueryFinanceDto,
  ) {
    return this.financeService.getWithdrawals(branchId, query);
  }

  @Post('withdrawals')
  @ApiOperation({ summary: 'Create a withdrawal' })
  createWithdrawal(
    @CurrentBranch() branchId: number,
    @Body() dto: CreateWithdrawalDto,
    @CurrentUser() user: any,
  ) {
    return this.financeService.createWithdrawal(branchId, dto, user.id);
  }

  @Get('withdrawals/summary')
  @ApiOperation({ summary: 'Withdrawals summary with chart data' })
  getWithdrawalsSummary(
    @CurrentBranch() branchId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getWithdrawalsSummary(branchId, startDate, endDate);
  }

  // ─── EXPENSES ──────────────────────────────────────────────────────

  @Get('expenses')
  @ApiOperation({ summary: 'List expenses with filters' })
  getExpenses(
    @CurrentBranch() branchId: number,
    @Query() query: QueryFinanceDto,
  ) {
    return this.financeService.getExpenses(branchId, query);
  }

  @Post('expenses')
  @ApiOperation({ summary: 'Create an expense' })
  createExpense(
    @CurrentBranch() branchId: number,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.financeService.createExpense(branchId, dto);
  }

  @Get('expenses/summary')
  @ApiOperation({ summary: 'Expenses summary by category' })
  getExpensesSummary(
    @CurrentBranch() branchId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getExpensesSummary(branchId, startDate, endDate);
  }

  // ─── SALARIES ──────────────────────────────────────────────────────

  @Get('salaries')
  @ApiOperation({ summary: 'Get calculated teacher salaries' })
  getSalaries(
    @CurrentBranch() branchId: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.financeService.getSalaries(branchId, month, year);
  }

  @Post('salaries/calculate')
  @ApiOperation({ summary: 'Calculate and save teacher salaries' })
  calculateSalaries(
    @CurrentBranch() branchId: number,
    @Body('month') month: number,
    @Body('year') year: number,
  ) {
    return this.financeService.calculateSalaries(branchId, month, year);
  }

  @Patch('salaries/:id/pay')
  @ApiOperation({ summary: 'Mark salary as paid' })
  paySalary(@Param('id', ParseIntPipe) id: number) {
    return this.financeService.paySalary(id);
  }

  // ─── DEBTORS ───────────────────────────────────────────────────────

  @Get('debtors')
  @ApiOperation({ summary: 'List students with debt' })
  getDebtors(
    @CurrentBranch() branchId: number,
    @Query() query: QueryFinanceDto,
  ) {
    return this.financeService.getDebtors(branchId, query);
  }

  // ─── FINANCE CATEGORIES ─────────────────────────────────────────

  @Get('categories')
  @ApiOperation({ summary: 'List finance categories (cash/bank/custom)' })
  getCategories(@CurrentBranch() branchId: number) {
    return this.financeService.getCategories(branchId);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create finance category' })
  createCategory(
    @CurrentBranch() branchId: number,
    @Body() dto: { key: string; label: string; color?: string },
  ) {
    return this.financeService.createCategory(branchId, dto);
  }

  // ─── SUMMARY ───────────────────────────────────────────────────────

  @Get('summary')
  @ApiOperation({ summary: 'Overall finance summary' })
  getSummary(@CurrentBranch() branchId: number) {
    return this.financeService.getFinanceSummary(branchId);
  }

  @Get('summary/by-category')
  @ApiOperation({ summary: 'Finance summary grouped by category (cash/bank)' })
  getSummaryByCategory(@CurrentBranch() branchId: number) {
    return this.financeService.getFinanceSummaryByCategory(branchId);
  }
}
