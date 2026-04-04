import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { QueryFinanceDto } from './dto/query-finance.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ─── PAYMENTS ──────────────────────────────────────────────────────

  async getPayments(branchId: number, query: QueryFinanceDto) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      startDate,
      endDate,
      studentId,
      method,
      minAmount,
      maxAmount,
      createdById,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { branchId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (studentId) where.studentId = studentId;
    if (method) where.method = method;
    if (createdById) where.createdById = createdById;

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = minAmount;
      if (maxAmount) where.amount.lte = maxAmount;
    }

    if (search) {
      where.student = {
        user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
          ],
        },
      };
    }

    const [data, total, aggregation] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          student: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, phone: true } },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
      this.prisma.payment.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      totalAmount: aggregation._sum.amount || 0,
    };
  }

  async createPayment(branchId: number, dto: CreatePaymentDto, userId: number) {
    const payment = await this.prisma.payment.create({
      data: {
        branchId,
        studentId: dto.studentId,
        amount: dto.amount,
        method: dto.method as any,
        description: dto.description,
        createdById: userId,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
      include: {
        student: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    // Update student balance (increment)
    await this.prisma.student.update({
      where: { id: dto.studentId },
      data: {
        balance: { increment: dto.amount },
      },
    });

    return payment;
  }

  async getPaymentsSummary(branchId: number, startDate?: string, endDate?: string) {
    const where: any = { branchId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const totalRevenue = await this.prisma.payment.aggregate({
      where,
      _sum: { amount: true },
    });

    // Monthly chart data (last 12 months)
    const now = new Date();
    const monthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const payments = await this.prisma.payment.findMany({
      where: {
        branchId,
        date: { gte: monthsAgo },
      },
      select: { amount: true, date: true },
    });

    const chartData = this.aggregateByMonth(payments);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      chartData,
    };
  }

  // ─── WITHDRAWALS ───────────────────────────────────────────────────

  async getWithdrawals(branchId: number, query: QueryFinanceDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
      startDate,
      endDate,
      method,
      minAmount,
      maxAmount,
      createdById,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { branchId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (method) where.method = method;
    if (createdById) where.createdById = createdById;

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = minAmount;
      if (maxAmount) where.amount.lte = maxAmount;
    }

    const [data, total, aggregation] = await Promise.all([
      this.prisma.withdrawal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.withdrawal.count({ where }),
      this.prisma.withdrawal.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      totalAmount: aggregation._sum.amount || 0,
    };
  }

  async createWithdrawal(branchId: number, dto: CreateWithdrawalDto, userId: number) {
    return this.prisma.withdrawal.create({
      data: {
        branchId,
        amount: dto.amount,
        method: dto.method as any,
        description: dto.description,
        category: dto.category,
        createdById: userId,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async getWithdrawalsSummary(branchId: number, startDate?: string, endDate?: string) {
    const where: any = { branchId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const totalWithdrawals = await this.prisma.withdrawal.aggregate({
      where,
      _sum: { amount: true },
    });

    const now = new Date();
    const monthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const withdrawals = await this.prisma.withdrawal.findMany({
      where: {
        branchId,
        date: { gte: monthsAgo },
      },
      select: { amount: true, date: true },
    });

    const chartData = this.aggregateByMonth(withdrawals);

    return {
      totalWithdrawals: totalWithdrawals._sum.amount || 0,
      chartData,
    };
  }

  // ─── EXPENSES ──────────────────────────────────────────────────────

  async getExpenses(branchId: number, query: QueryFinanceDto) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      startDate,
      endDate,
      minAmount,
      maxAmount,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { branchId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) where.amount.gte = minAmount;
      if (maxAmount) where.amount.lte = maxAmount;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total, aggregation] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.expense.count({ where }),
      this.prisma.expense.aggregate({
        where,
        _sum: { amount: true },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      totalAmount: aggregation._sum.amount || 0,
    };
  }

  async createExpense(branchId: number, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        branchId,
        title: dto.title,
        amount: dto.amount,
        category: dto.category,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
  }

  async getExpensesSummary(branchId: number, startDate?: string, endDate?: string) {
    const where: any = { branchId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      select: { amount: true, category: true },
    });

    const byCategory: Record<string, number> = {};
    let total = 0;
    for (const e of expenses) {
      const amt = Number(e.amount);
      total += amt;
      byCategory[e.category] = (byCategory[e.category] || 0) + amt;
    }

    return {
      totalExpenses: total,
      byCategory: Object.entries(byCategory).map(([category, amount]) => ({
        category,
        amount,
      })),
    };
  }

  // ─── SALARIES ──────────────────────────────────────────────────────

  async getSalaries(branchId: number, month: number, year: number) {
    // Check if already calculated
    const existing = await this.prisma.salary.findMany({
      where: {
        month,
        year,
        teacher: {
          groups: {
            some: { branchId },
          },
        },
      },
      include: {
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            groups: {
              where: { branchId, status: 'ACTIVE' },
              include: {
                course: { select: { name: true, price: true } },
                students: { where: { status: 'ACTIVE' } },
              },
            },
          },
        },
      },
    });

    if (existing.length > 0) {
      // Return grouped by teacher
      return this.groupSalariesByTeacher(existing);
    }

    // Calculate on the fly
    return this.calculateSalariesData(branchId, month, year);
  }

  async calculateSalaries(branchId: number, month: number, year: number) {
    const salaryData = await this.calculateSalariesData(branchId, month, year);

    // Save to database
    for (const teacher of salaryData) {
      for (const group of teacher.groups) {
        await this.prisma.salary.upsert({
          where: {
            teacherId_groupId_month_year: {
              teacherId: teacher.teacherId,
              groupId: group.groupId,
              month,
              year,
            },
          },
          create: {
            teacherId: teacher.teacherId,
            groupId: group.groupId,
            month,
            year,
            amount: group.amount,
          },
          update: {
            amount: group.amount,
          },
        });
      }
    }

    return salaryData;
  }

  async paySalary(salaryId: number) {
    const salary = await this.prisma.salary.findUnique({
      where: { id: salaryId },
      include: {
        teacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            groups: { take: 1 },
          },
        },
      },
    });

    if (!salary) {
      throw new NotFoundException('Salary not found');
    }

    // Mark as paid
    const updated = await this.prisma.salary.update({
      where: { id: salaryId },
      data: { isPaid: true, paidAt: new Date() },
    });

    // Find branchId from teacher's group
    const branchId = salary.teacher.groups[0]?.branchId;
    if (branchId) {
      // Create withdrawal record
      await this.prisma.withdrawal.create({
        data: {
          branchId,
          amount: salary.amount,
          method: 'TRANSFER',
          description: `Salary payment: ${salary.teacher.user.firstName} ${salary.teacher.user.lastName} (${salary.month}/${salary.year})`,
          category: 'SALARY',
          date: new Date(),
        },
      });
    }

    return updated;
  }

  // ─── DEBTORS ───────────────────────────────────────────────────────

  async getDebtors(branchId: number, query: QueryFinanceDto) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'balance',
      sortOrder = 'asc',
      minAmount,
      maxAmount,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      branchId,
      isArchived: false,
      balance: { lt: 0 },
    };

    if (minAmount || maxAmount) {
      if (minAmount) where.balance.lte = -minAmount; // minAmount debt means balance <= -minAmount
      if (maxAmount) where.balance.gte = -maxAmount;
    }

    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, phone: true } },
          groupEnrollments: {
            where: { status: 'ACTIVE' },
            include: {
              group: {
                select: { id: true, name: true, course: { select: { name: true } } },
              },
            },
          },
          payments: {
            orderBy: { date: 'desc' },
            take: 1,
            select: { date: true },
          },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    const debtors = data.map((s) => ({
      id: s.id,
      userId: s.user.id,
      studentName: `${s.user.firstName} ${s.user.lastName}`,
      phone: s.user.phone,
      balance: s.balance,
      groups: s.groupEnrollments.map((ge) => ({
        id: ge.group.id,
        name: ge.group.name,
        courseName: ge.group.course.name,
      })),
      lastPaymentDate: s.payments[0]?.date || null,
      note: s.note,
    }));

    return {
      data: debtors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── SUMMARY ───────────────────────────────────────────────────────

  async getFinanceSummary(branchId: number) {
    const [revenueAgg, withdrawalAgg, expenseAgg] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { branchId },
        _sum: { amount: true },
      }),
      this.prisma.withdrawal.aggregate({
        where: { branchId },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { branchId },
        _sum: { amount: true },
      }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.amount || 0);
    const totalWithdrawals = Number(withdrawalAgg._sum.amount || 0);
    const totalExpenses = Number(expenseAgg._sum.amount || 0);
    const netProfit = totalRevenue - totalWithdrawals - totalExpenses;

    // Monthly chart (last 12 months)
    const now = new Date();
    const monthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [payments, withdrawals, expenses] = await Promise.all([
      this.prisma.payment.findMany({
        where: { branchId, date: { gte: monthsAgo } },
        select: { amount: true, date: true },
      }),
      this.prisma.withdrawal.findMany({
        where: { branchId, date: { gte: monthsAgo } },
        select: { amount: true, date: true },
      }),
      this.prisma.expense.findMany({
        where: { branchId, date: { gte: monthsAgo } },
        select: { amount: true, date: true },
      }),
    ]);

    const revenueByMonth = this.aggregateByMonth(payments);
    const expensesByMonth = this.aggregateByMonth([...withdrawals, ...expenses]);

    // Merge into chart data
    const monthKeys = new Set([
      ...revenueByMonth.map((d) => d.month),
      ...expensesByMonth.map((d) => d.month),
    ]);
    const chartData = Array.from(monthKeys)
      .sort()
      .map((month) => ({
        month,
        revenue: revenueByMonth.find((d) => d.month === month)?.amount || 0,
        expenses: expensesByMonth.find((d) => d.month === month)?.amount || 0,
      }));

    return {
      totalRevenue,
      totalWithdrawals,
      totalExpenses,
      netProfit,
      chartData,
    };
  }

  // ─── HELPERS ───────────────────────────────────────────────────────

  private aggregateByMonth(records: { amount: any; date: Date }[]) {
    const map: Record<string, number> = {};
    for (const r of records) {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + Number(r.amount);
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }));
  }

  private async calculateSalariesData(branchId: number, month: number, year: number) {
    const teachers = await this.prisma.teacher.findMany({
      where: {
        groups: { some: { branchId, status: 'ACTIVE' } },
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        groups: {
          where: { branchId, status: 'ACTIVE' },
          include: {
            course: { select: { name: true, price: true } },
            students: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    // Count lessons per group in the given month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const attendanceRecords = await this.prisma.attendance.findMany({
      where: {
        group: { branchId },
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { groupId: true, date: true },
      distinct: ['groupId', 'date'],
    });

    // Count distinct lesson dates per group
    const lessonsByGroup: Record<number, number> = {};
    for (const a of attendanceRecords) {
      lessonsByGroup[a.groupId] = (lessonsByGroup[a.groupId] || 0) + 1;
    }

    return teachers.map((teacher) => {
      const groups = teacher.groups.map((group) => {
        const students = group.students.length;
        const lessons = lessonsByGroup[group.id] || 0;
        // Simple calculation: (course price / 12) per student for the month
        const coursePrice = Number(group.course.price);
        const amount = Math.round((coursePrice / 12) * students * 0.3 * 100) / 100; // 30% to teacher

        return {
          groupId: group.id,
          groupName: group.name,
          courseName: group.course.name,
          students,
          lessons,
          amount,
        };
      });

      return {
        teacherId: teacher.id,
        teacherName: `${teacher.user.firstName} ${teacher.user.lastName}`,
        groups,
        total: groups.reduce((sum, g) => sum + g.amount, 0),
      };
    });
  }

  // ─── CATEGORIES ──────────────────────────────────────────────────

  async getCategories(branchId: number) {
    return this.prisma.financeCategory.findMany({
      where: { branchId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createCategory(branchId: number, dto: { key: string; label: string; color?: string }) {
    const maxSort = await this.prisma.financeCategory.aggregate({
      where: { branchId },
      _max: { sortOrder: true },
    });
    return this.prisma.financeCategory.create({
      data: {
        branchId,
        key: dto.key,
        label: dto.label,
        color: dto.color || '#06b6d4',
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
      },
    });
  }

  async getFinanceSummaryByCategory(branchId: number) {
    const categories = await this.getCategories(branchId);
    const result: any[] = [];

    for (const cat of categories) {
      const [payments, withdrawals] = await Promise.all([
        this.prisma.payment.aggregate({
          where: { branchId, category: cat.key },
          _sum: { amount: true },
        }),
        this.prisma.withdrawal.aggregate({
          where: { branchId, category: cat.key },
          _sum: { amount: true },
        }),
      ]);

      result.push({
        category: cat.key,
        label: cat.label,
        color: cat.color,
        income: Number(payments._sum.amount || 0),
        withdrawal: Number(withdrawals._sum.amount || 0),
      });
    }

    return result;
  }

  private groupSalariesByTeacher(salaries: any[]) {
    const map: Record<number, any> = {};
    for (const s of salaries) {
      if (!map[s.teacherId]) {
        map[s.teacherId] = {
          teacherId: s.teacherId,
          teacherName: `${s.teacher.user.firstName} ${s.teacher.user.lastName}`,
          groups: [],
          total: 0,
        };
      }
      const teacherGroups = s.teacher.groups || [];
      const matchedGroup = teacherGroups.find((g: any) => g.id === s.groupId);
      map[s.teacherId].groups.push({
        salaryId: s.id,
        groupId: s.groupId,
        groupName: matchedGroup?.name || '—',
        courseName: matchedGroup?.course?.name || '—',
        students: matchedGroup?.students?.length || 0,
        lessons: 0,
        amount: Number(s.amount),
        isPaid: s.isPaid,
        paidAt: s.paidAt,
      });
      map[s.teacherId].total += Number(s.amount);
    }
    return Object.values(map);
  }
}
