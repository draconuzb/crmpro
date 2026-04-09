import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  payment: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  student: {
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  withdrawal: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  expense: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  salary: {
    findMany: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
  financeCategory: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  groupStudent: { findMany: jest.fn() },
  lessonPayment: { aggregate: jest.fn() },
  $transaction: jest.fn((fn: any) => fn(mockPrisma)),
};

describe('FinanceService', () => {
  let service: FinanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a payment and update student balance', async () => {
      const paymentData = { studentId: 1, amount: 500000, method: 'CASH' as const, description: 'Monthly fee' };
      const branchId = 1;
      const mockPayment = { id: 1, ...paymentData, branchId, date: new Date(), createdAt: new Date() };

      mockPrisma.payment.create.mockResolvedValue({
        ...mockPayment,
        student: { user: { id: 1, firstName: 'Ali', lastName: 'Valiyev', phone: '+998901234567' } },
      });
      mockPrisma.student.update.mockResolvedValue({ id: 1, balance: 500000 });

      const result = await service.createPayment(branchId, paymentData, 1);

      expect(mockPrisma.student.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { balance: { increment: 500000 } },
      });
      expect(mockPrisma.payment.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle zero amount gracefully', async () => {
      const paymentData = { studentId: 1, amount: 0, method: 'CASH' as const };

      mockPrisma.payment.create.mockResolvedValue({
        id: 2, ...paymentData, branchId: 1,
        student: { user: { id: 1, firstName: 'Test', lastName: 'User', phone: '+998900000000' } },
      });
      mockPrisma.student.update.mockResolvedValue({ id: 1, balance: 0 });

      const result = await service.createPayment(1, paymentData, 1);
      expect(result).toBeDefined();
    });
  });

  describe('getPayments', () => {
    it('should return paginated payments with meta', async () => {
      const mockPayments = [
        { id: 1, amount: 500000, student: { user: { firstName: 'Ali', lastName: 'V', phone: '+998901234567' } } },
      ];
      mockPrisma.payment.findMany.mockResolvedValue(mockPayments);
      mockPrisma.payment.count.mockResolvedValue(1);

      const result = await service.getPayments(1, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by date range', async () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);
      mockPrisma.payment.count.mockResolvedValue(0);

      await service.getPayments(1, { startDate: '2026-01-01', endDate: '2026-01-31' });

      const call = mockPrisma.payment.findMany.mock.calls[0][0];
      expect(call.where.date).toBeDefined();
      expect(call.where.date.gte).toBeInstanceOf(Date);
    });
  });

  describe('getDebtors', () => {
    it('should return students with negative balance', async () => {
      mockPrisma.student.findMany.mockResolvedValue([
        { id: 1, balance: -200000, user: { firstName: 'Ali', lastName: 'V', phone: '+998901234567' }, groupEnrollments: [{ group: { name: 'English A1' } }] },
      ]);
      mockPrisma.student.count.mockResolvedValue(1);

      const result = await service.getDebtors(1, {});

      expect(result.data).toHaveLength(1);
      expect(Number(result.data[0].balance)).toBeLessThan(0);
    });
  });

  describe('createExpense', () => {
    it('should create an expense record', async () => {
      const expenseData = { title: 'Office supplies', amount: 100000, category: 'office' };
      mockPrisma.expense.create.mockResolvedValue({ id: 1, branchId: 1, ...expenseData, date: new Date() });

      const result = await service.createExpense(1, expenseData);

      expect(mockPrisma.expense.create).toHaveBeenCalled();
      expect(result.title).toBe('Office supplies');
    });
  });

  describe('getFinanceSummary', () => {
    it('should return aggregated finance summary', async () => {
      mockPrisma.payment.aggregate.mockResolvedValue({ _sum: { amount: 5000000 } });
      mockPrisma.withdrawal.aggregate.mockResolvedValue({ _sum: { amount: 1000000 } });
      mockPrisma.expense.aggregate.mockResolvedValue({ _sum: { amount: 500000 } });
      mockPrisma.expense.groupBy.mockResolvedValue([]);

      const result = await service.getSummary(1);

      expect(result).toBeDefined();
      expect(result.totalRevenue).toBeDefined();
    });
  });
});
