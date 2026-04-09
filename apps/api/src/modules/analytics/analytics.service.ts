import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface DateRange { start: Date; end: Date; }
interface FilterParams { month?: string; quarter?: string; range?: string; year?: string; branchId?: number; }

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════
  // FILTER → DATE RANGE
  // ═══════════════════════════════════════════════

  private parseFilter(params: FilterParams): { current: DateRange; previous: DateRange; months: string[] } {
    const now = new Date();
    const uzMonths: Record<string, number> = { Yanvar:0, Fevral:1, Mart:2, Aprel:3, May:4, Iyun:5, Iyul:6, Avgust:7, Sentyabr:8, Oktabr:9, Noyabr:10, Dekabr:11 };
    const monthNames = Object.keys(uzMonths);
    let start: Date, end: Date, prevStart: Date, prevEnd: Date;
    const filterMonths: string[] = [];

    if (params.quarter) {
      const [q, yr] = params.quarter.split(' ');
      const qn = parseInt(q.replace('Q', ''));
      const y = parseInt(yr);
      const fm = (qn - 1) * 3;
      start = new Date(y, fm, 1);
      end = new Date(y, fm + 3, 0, 23, 59, 59, 999);
      prevStart = new Date(y, fm - 3, 1);
      prevEnd = new Date(y, fm, 0, 23, 59, 59, 999);
      for (let i = 0; i < 3; i++) filterMonths.push(`${monthNames[fm + i]} ${y}`);
    } else if (params.range) {
      const rangeMap: Record<string, number> = { last3: 3, last6: 6, last12: 12 };
      const n = rangeMap[params.range] || 6;
      start = new Date(now.getFullYear(), now.getMonth() - n + 1, 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 2 * n + 1, 1);
      prevEnd = new Date(start.getTime() - 1);
      for (let i = 0; i < n; i++) {
        const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
        filterMonths.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
      }
    } else if (params.year) {
      const y = parseInt(params.year);
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31, 23, 59, 59, 999);
      prevStart = new Date(y - 1, 0, 1);
      prevEnd = new Date(y - 1, 11, 31, 23, 59, 59, 999);
      for (let i = 0; i < 12; i++) filterMonths.push(`${monthNames[i]} ${y}`);
    } else {
      // Default: single month
      const monthStr = params.month || `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
      const parts = monthStr.split(' ');
      const mi = uzMonths[parts[0]] ?? now.getMonth();
      const y = parseInt(parts[1]) || now.getFullYear();
      start = new Date(y, mi, 1);
      end = new Date(y, mi + 1, 0, 23, 59, 59, 999);
      prevStart = new Date(y, mi - 1, 1);
      prevEnd = new Date(y, mi, 0, 23, 59, 59, 999);
      filterMonths.push(monthStr);
    }

    return { current: { start, end }, previous: { start: prevStart, end: prevEnd }, months: filterMonths };
  }

  private bw(branchId?: number) { return branchId ? { branchId } : {}; }
  private bwg(branchId?: number) { return branchId ? { group: { branchId } } : {}; }

  // ═══════════════════════════════════════════════
  // CEO DASHBOARD OVERVIEW (Bosh sahifa)
  // ═══════════════════════════════════════════════

  async getDashboardOverview(params: FilterParams) {
    const { current, previous, months } = this.parseFilter(params);
    const bw = this.bw(params.branchId);
    const bwg = this.bwg(params.branchId);

    // Finance by month
    const financeByMonth = await Promise.all(months.map(async (m) => {
      const uzMonths: Record<string, number> = { Yanvar:0, Fevral:1, Mart:2, Aprel:3, May:4, Iyun:5, Iyul:6, Avgust:7, Sentyabr:8, Oktabr:9, Noyabr:10, Dekabr:11 };
      const [name, yr] = m.split(' ');
      const mi = uzMonths[name]; const y = parseInt(yr);
      const ms = new Date(y, mi, 1); const me = new Date(y, mi + 1, 0, 23, 59, 59, 999);
      const [rev, exp] = await Promise.all([
        this.prisma.payment.aggregate({ where: { ...bw, date: { gte: ms, lte: me } }, _sum: { amount: true } }),
        this.prisma.expense.aggregate({ where: { ...bw, date: { gte: ms, lte: me } }, _sum: { amount: true } }),
      ]);
      return { month: m, income: Number(rev._sum.amount || 0), expense: Number(exp._sum.amount || 0) };
    }));

    // Debtors by month
    const debtorsByMonth = await Promise.all(months.map(async (m) => {
      const uzMonths: Record<string, number> = { Yanvar:0, Fevral:1, Mart:2, Aprel:3, May:4, Iyun:5, Iyul:6, Avgust:7, Sentyabr:8, Oktabr:9, Noyabr:10, Dekabr:11 };
      const [name, yr] = m.split(' ');
      const mi = uzMonths[name]; const y = parseInt(yr);
      const me = new Date(y, mi + 1, 0, 23, 59, 59, 999);
      const count = await this.prisma.student.count({ where: { ...bw, balance: { lt: 0 }, isArchived: false, updatedAt: { lte: me } } });
      const agg = await this.prisma.student.aggregate({ where: { ...bw, balance: { lt: 0 }, isArchived: false }, _sum: { balance: true } });
      return { month: m, count, amount: Math.abs(Number(agg._sum.balance || 0)) };
    }));

    // Leads & rejections
    const [leads, prevLeads, activeStudents] = await Promise.all([
      this.prisma.lead.findMany({ where: { ...bw, createdAt: { gte: current.start, lte: current.end } }, select: { status: true, courseId: true, course: { select: { name: true } } } }),
      this.prisma.lead.count({ where: { ...bw, createdAt: { gte: previous.start, lte: previous.end } } }),
      this.prisma.student.count({ where: { ...bw, isArchived: false, groupEnrollments: { some: { status: 'ACTIVE' } } } }),
    ]);

    const leadsBySubject: Record<string, number> = {};
    leads.forEach(l => { const c = l.course?.name || 'Boshqa'; leadsBySubject[c] = (leadsBySubject[c] || 0) + 1; });

    // Attendance
    const attRecords = await this.prisma.attendance.findMany({
      where: { ...this.bwg(params.branchId), date: { gte: current.start, lte: current.end } },
      select: { date: true, status: true },
    });
    const attByDate: Record<string, { present: number; total: number }> = {};
    attRecords.forEach(r => {
      const d = new Date(r.date).toISOString().split('T')[0];
      if (!attByDate[d]) attByDate[d] = { present: 0, total: 0 };
      attByDate[d].total++;
      if (r.status === 'PRESENT' || r.status === 'LATE') attByDate[d].present++;
    });
    const attTotal = attRecords.length;
    const attPresent = attRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;

    // Problems
    const problems = await this.prisma.problem.findMany({
      where: { ...bw, status: { not: 'resolved' } },
      include: { branch: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Rooms
    const rooms = await this.prisma.emptyRoom.findMany({
      where: bw,
      include: { room: { select: { name: true } }, branch: { select: { name: true } } },
    });
    const totalPotential = rooms.reduce((s, r) => s + Number(r.capacity) * Number(r.pricePerStudent), 0);

    // Branch breakdown (for CEO) — batch queries instead of N per branch
    let branchBreakdown: any[] = [];
    if (!params.branchId) {
      const branches = await this.prisma.branch.findMany({ where: { isActive: true }, select: { id: true, name: true } });
      const branchIds = branches.map(b => b.id);
      const dateFilter = { gte: current.start, lte: current.end };

      const [revByBranch, expByBranch, leadsByBranch, debtByBranch, probByBranch] = await Promise.all([
        this.prisma.payment.groupBy({ by: ['branchId'], where: { branchId: { in: branchIds }, date: dateFilter }, _sum: { amount: true } }),
        this.prisma.expense.groupBy({ by: ['branchId'], where: { branchId: { in: branchIds }, date: dateFilter }, _sum: { amount: true } }),
        this.prisma.lead.groupBy({ by: ['branchId'], where: { branchId: { in: branchIds }, createdAt: dateFilter }, _count: true }),
        this.prisma.student.groupBy({ by: ['branchId'], where: { branchId: { in: branchIds }, balance: { lt: 0 }, isArchived: false }, _count: true }),
        this.prisma.problem.groupBy({ by: ['branchId'], where: { branchId: { in: branchIds }, status: { not: 'resolved' } }, _count: true }),
      ]);

      const revMap = new Map(revByBranch.map(r => [r.branchId, Number(r._sum.amount || 0)]));
      const expMap = new Map(expByBranch.map(r => [r.branchId, Number(r._sum.amount || 0)]));
      const leadMap = new Map(leadsByBranch.map(r => [r.branchId, r._count]));
      const debtMap = new Map(debtByBranch.map(r => [r.branchId, r._count]));
      const probMap = new Map(probByBranch.map(r => [r.branchId, r._count]));

      branchBreakdown = branches.map(b => {
        const income = revMap.get(b.id) || 0;
        const expense = expMap.get(b.id) || 0;
        return {
          branchId: b.id, branchName: b.name,
          income, expense, profit: Number(income) - Number(expense),
          leads: leadMap.get(b.id) || 0,
          attendance: 0, // attendance rate requires separate calculation
          debtors: debtMap.get(b.id) || 0,
          problems: probMap.get(b.id) || 0,
        };
      });
    }

    return {
      filterMonths: months,
      finance: { byMonth: financeByMonth, total: { income: financeByMonth.reduce((s, m) => s + m.income, 0), expense: financeByMonth.reduce((s, m) => s + m.expense, 0) } },
      debtors: { byMonth: debtorsByMonth, total: { count: debtorsByMonth.reduce((s, m) => s + m.count, 0), amount: debtorsByMonth.reduce((s, m) => s + m.amount, 0) } },
      leads: { total: leads.length, prevTotal: prevLeads, bySubject: Object.entries(leadsBySubject).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count) },
      activeStudents,
      attendance: { rate: attTotal ? Math.round((attPresent / attTotal) * 100) : 0, total: attTotal, present: attPresent, daily: Object.entries(attByDate).map(([date, s]) => ({ date, ...s, rate: s.total ? Math.round((s.present / s.total) * 100) : 0 })).sort((a, b) => a.date.localeCompare(b.date)) },
      problems: problems.map(p => ({ id: p.id, type: p.type, issue: p.issue, status: p.status, branch: p.branch.name, createdAt: p.createdAt })),
      rooms: { count: rooms.length, totalPotential, list: rooms.map(r => ({ id: r.id, branch: r.branch.name, room: r.room?.name || '', days: r.days, time: r.timeSlot, period: r.period, capacity: r.capacity, price: Number(r.pricePerStudent), potential: r.capacity * Number(r.pricePerStudent) })) },
      branchBreakdown,
    };
  }

  // ═══════════════════════════════════════════════
  // BRANCH TRENDS (single branch analytics)
  // ═══════════════════════════════════════════════

  async getBranchTrends(params: FilterParams) {
    const { current, previous, months } = this.parseFilter(params);
    const bw = this.bw(params.branchId);

    // Monthly revenue/expense/leads/attendance/debtors trends
    const uzMonths: Record<string, number> = { Yanvar:0, Fevral:1, Mart:2, Aprel:3, May:4, Iyun:5, Iyul:6, Avgust:7, Sentyabr:8, Oktabr:9, Noyabr:10, Dekabr:11 };

    const trends = await Promise.all(months.map(async (m) => {
      const [name, yr] = m.split(' ');
      const mi = uzMonths[name]; const y = parseInt(yr);
      const ms = new Date(y, mi, 1); const me = new Date(y, mi + 1, 0, 23, 59, 59, 999);

      const [rev, exp, leads, rej, att, debt] = await Promise.all([
        this.prisma.payment.aggregate({ where: { ...bw, date: { gte: ms, lte: me } }, _sum: { amount: true } }),
        this.prisma.expense.aggregate({ where: { ...bw, date: { gte: ms, lte: me } }, _sum: { amount: true } }),
        this.prisma.lead.count({ where: { ...bw, createdAt: { gte: ms, lte: me } } }),
        this.prisma.lead.count({ where: { ...bw, createdAt: { gte: ms, lte: me }, student: { isNot: null } } }),
        this.getAttendanceRate(ms, me, params.branchId),
        this.prisma.student.aggregate({ where: { ...bw, balance: { lt: 0 }, isArchived: false }, _sum: { balance: true } }),
      ]);

      return {
        month: m,
        income: Number(rev._sum.amount || 0), expense: Number(exp._sum.amount || 0),
        profit: Number(rev._sum.amount || 0) - Number(exp._sum.amount || 0),
        leads, rejections: rej, attendance: att,
        debtAmount: Math.abs(Number(debt._sum.balance || 0)),
      };
    }));

    // Period comparison
    const [curRev, prevRev, curExp, prevExp, curLeads, prevLeads, curAtt, prevAtt] = await Promise.all([
      this.prisma.payment.aggregate({ where: { ...bw, date: { gte: current.start, lte: current.end } }, _sum: { amount: true } }),
      this.prisma.payment.aggregate({ where: { ...bw, date: { gte: previous.start, lte: previous.end } }, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where: { ...bw, date: { gte: current.start, lte: current.end } }, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where: { ...bw, date: { gte: previous.start, lte: previous.end } }, _sum: { amount: true } }),
      this.prisma.lead.count({ where: { ...bw, createdAt: { gte: current.start, lte: current.end } } }),
      this.prisma.lead.count({ where: { ...bw, createdAt: { gte: previous.start, lte: previous.end } } }),
      this.getAttendanceRate(current.start, current.end, params.branchId),
      this.getAttendanceRate(previous.start, previous.end, params.branchId),
    ]);

    return {
      trends,
      comparison: {
        income: { current: Number(curRev._sum.amount || 0), previous: Number(prevRev._sum.amount || 0), growth: this.growthRate(Number(curRev._sum.amount || 0), Number(prevRev._sum.amount || 0)) },
        expense: { current: Number(curExp._sum.amount || 0), previous: Number(prevExp._sum.amount || 0), growth: this.growthRate(Number(curExp._sum.amount || 0), Number(prevExp._sum.amount || 0)) },
        profit: { current: Number(curRev._sum.amount || 0) - Number(curExp._sum.amount || 0), previous: Number(prevRev._sum.amount || 0) - Number(prevExp._sum.amount || 0), growth: this.growthRate(Number(curRev._sum.amount || 0) - Number(curExp._sum.amount || 0), Number(prevRev._sum.amount || 0) - Number(prevExp._sum.amount || 0)) },
        leads: { current: curLeads, previous: prevLeads, growth: this.growthRate(curLeads, prevLeads) },
        attendance: { current: curAtt, previous: prevAtt, growth: this.growthRate(curAtt, prevAtt) },
      },
    };
  }

  // ═══════════════════════════════════════════════
  // BRANCH COMPARISON (multi-branch ranking)
  // ═══════════════════════════════════════════════

  async getBranchComparison(params: FilterParams) {
    const { current, previous } = this.parseFilter(params);
    const branches = await this.prisma.branch.findMany({ where: { isActive: true }, select: { id: true, name: true } });

    const results = await Promise.all(branches.map(async (branch) => {
      const [revenue, prevRevenue, leads, prevLeads, students, attendance, debtors, expenses, rooms, problems] = await Promise.all([
        this.prisma.payment.aggregate({ where: { branchId: branch.id, date: { gte: current.start, lte: current.end } }, _sum: { amount: true } }),
        this.prisma.payment.aggregate({ where: { branchId: branch.id, date: { gte: previous.start, lte: previous.end } }, _sum: { amount: true } }),
        this.prisma.lead.count({ where: { branchId: branch.id, createdAt: { gte: current.start, lte: current.end } } }),
        this.prisma.lead.count({ where: { branchId: branch.id, createdAt: { gte: previous.start, lte: previous.end } } }),
        this.prisma.student.count({ where: { branchId: branch.id, isArchived: false, groupEnrollments: { some: { status: 'ACTIVE' } } } }),
        this.getAttendanceRate(current.start, current.end, branch.id),
        this.prisma.student.count({ where: { branchId: branch.id, balance: { lt: 0 }, isArchived: false } }),
        this.prisma.expense.aggregate({ where: { branchId: branch.id, date: { gte: current.start, lte: current.end } }, _sum: { amount: true } }),
        this.prisma.emptyRoom.count({ where: { branchId: branch.id } }),
        this.prisma.problem.count({ where: { branchId: branch.id, status: { not: 'resolved' } } }),
      ]);

      const rev = Number(revenue._sum.amount || 0);
      const prevRev = Number(prevRevenue._sum.amount || 0);
      const exp = Number(expenses._sum.amount || 0);
      const revenueScore = Math.min(rev / 10000000, 100);
      const leadsScore = Math.min(leads * 5, 100);
      const debtorScore = Math.max(100 - debtors * 10, 0);
      const composite = Math.round(revenueScore * 0.4 + attendance * 0.25 + leadsScore * 0.2 + debtorScore * 0.15);

      return {
        branchId: branch.id, branchName: branch.name,
        revenue: rev, expenses: exp, profit: rev - exp,
        revenueGrowth: this.growthRate(rev, prevRev),
        leads, leadsGrowth: this.growthRate(leads, prevLeads),
        students, attendance, debtors, rooms, problems,
        compositeScore: composite,
      };
    }));

    return results.sort((a, b) => b.compositeScore - a.compositeScore);
  }

  // ═══════════════════════════════════════════════
  // ATTENDANCE TREND (multi-branch line chart)
  // ═══════════════════════════════════════════════

  async getAttendanceTrend(params: FilterParams) {
    const { months } = this.parseFilter(params);
    const uzMonths: Record<string, number> = { Yanvar:0, Fevral:1, Mart:2, Aprel:3, May:4, Iyun:5, Iyul:6, Avgust:7, Sentyabr:8, Oktabr:9, Noyabr:10, Dekabr:11 };

    if (params.branchId) {
      // Single branch — monthly attendance rates
      const data = await Promise.all(months.map(async (m) => {
        const [name, yr] = m.split(' ');
        const mi = uzMonths[name]; const y = parseInt(yr);
        const rate = await this.getAttendanceRate(new Date(y, mi, 1), new Date(y, mi + 1, 0, 23, 59, 59, 999), params.branchId);
        return { month: m, rate };
      }));
      return { type: 'single', data };
    }

    // Multi-branch — each branch as a separate line
    const branches = await this.prisma.branch.findMany({ where: { isActive: true }, select: { id: true, name: true } });
    const data = await Promise.all(branches.map(async (b) => {
      const rates = await Promise.all(months.map(async (m) => {
        const [name, yr] = m.split(' ');
        const mi = uzMonths[name]; const y = parseInt(yr);
        return { month: m, rate: await this.getAttendanceRate(new Date(y, mi, 1), new Date(y, mi + 1, 0, 23, 59, 59, 999), b.id) };
      }));
      return { branchId: b.id, branchName: b.name, rates };
    }));
    return { type: 'multi', data };
  }

  // ═══════════════════════════════════════════════
  // FINANCIAL INTELLIGENCE
  // ═══════════════════════════════════════════════

  async getFinancialIntelligence(params: FilterParams) {
    const { current, months } = this.parseFilter(params);
    const bw = this.bw(params.branchId);

    const [expByCat, payByMethod, debtorStudents, revenue, activeStudents, monthlyExpense] = await Promise.all([
      this.prisma.expense.groupBy({ by: ['category'], where: { ...bw, date: { gte: current.start, lte: current.end } }, _sum: { amount: true } }),
      this.prisma.payment.groupBy({ by: ['method'], where: { ...bw, date: { gte: current.start, lte: current.end } }, _sum: { amount: true }, _count: true }),
      this.prisma.student.findMany({ where: { ...bw, balance: { lt: 0 }, isArchived: false }, select: { balance: true, updatedAt: true }, orderBy: { balance: 'asc' } }),
      this.prisma.payment.aggregate({ where: { ...bw, date: { gte: current.start, lte: current.end } }, _sum: { amount: true } }),
      this.prisma.student.count({ where: { ...bw, isArchived: false, groupEnrollments: { some: { status: 'ACTIVE' } } } }),
      this.prisma.expense.aggregate({ where: { ...bw, date: { gte: current.start, lte: current.end } }, _sum: { amount: true } }),
    ]);

    const totalDebt = debtorStudents.reduce((s, d) => s + Math.abs(Number(d.balance)), 0);
    const rev = Number(revenue._sum.amount || 0);
    const exp = Number(monthlyExpense._sum.amount || 0);
    const revenuePerStudent = activeStudents ? Math.round(rev / activeStudents) : 0;
    const breakEvenStudents = revenuePerStudent > 0 ? Math.ceil(exp / revenuePerStudent) : 0;

    // Debtor aging
    const now = new Date();
    const aging = { d30: { count: 0, amount: 0 }, d60: { count: 0, amount: 0 }, d90: { count: 0, amount: 0 }, d90plus: { count: 0, amount: 0 } };
    debtorStudents.forEach(d => {
      const days = Math.floor((now.getTime() - d.updatedAt.getTime()) / (24 * 60 * 60 * 1000));
      const amt = Math.abs(Number(d.balance));
      if (days <= 30) { aging.d30.count++; aging.d30.amount += amt; }
      else if (days <= 60) { aging.d60.count++; aging.d60.amount += amt; }
      else if (days <= 90) { aging.d90.count++; aging.d90.amount += amt; }
      else { aging.d90plus.count++; aging.d90plus.amount += amt; }
    });

    // Cash flow trend
    const uzMonthsMap: Record<string, number> = { Yanvar:0, Fevral:1, Mart:2, Aprel:3, May:4, Iyun:5, Iyul:6, Avgust:7, Sentyabr:8, Oktabr:9, Noyabr:10, Dekabr:11 };
    const cashFlow = await Promise.all(months.map(async (m) => {
      const [name, yr] = m.split(' ');
      const mi = uzMonthsMap[name]; const y = parseInt(yr);
      const ms = new Date(y, mi, 1); const me = new Date(y, mi + 1, 0, 23, 59, 59, 999);
      const [r, e] = await Promise.all([
        this.prisma.payment.aggregate({ where: { ...bw, date: { gte: ms, lte: me } }, _sum: { amount: true } }),
        this.prisma.expense.aggregate({ where: { ...bw, date: { gte: ms, lte: me } }, _sum: { amount: true } }),
      ]);
      return { month: m, income: Number(r._sum.amount || 0), expense: Number(e._sum.amount || 0) };
    }));

    // Room revenue potential
    const rooms = await this.prisma.emptyRoom.findMany({
      where: bw,
      include: { room: { select: { name: true } }, branch: { select: { name: true } } },
      take: 10,
    });

    // Cumulative cash flow
    let cumulative = 0;
    const cashFlowWithCumulative = cashFlow.map(cf => {
      cumulative += cf.income - cf.expense;
      return { ...cf, cumulative };
    });

    // Expense breakdown by type with percentages
    const totalExpenseAmount = expByCat.reduce((s, e) => s + Number(e._sum.amount || 0), 0);
    const expenseBreakdown = expByCat
      .map(e => ({ type: e.category, amount: Number(e._sum.amount || 0), pct: totalExpenseAmount > 0 ? Math.round((Number(e._sum.amount || 0) / totalExpenseAmount) * 100) : 0 }))
      .sort((a, b) => b.amount - a.amount);

    // Seasonality — avg income/expense/leads per calendar month (last 12 months)
    // 3 queries instead of 36
    const yearAgo = new Date(new Date().getFullYear() - 1, 0, 1);
    const [allPayments, allExpenses, allLeads] = await Promise.all([
      this.prisma.payment.findMany({ where: { ...bw, date: { gte: yearAgo } }, select: { amount: true, date: true } }),
      this.prisma.expense.findMany({ where: { ...bw, date: { gte: yearAgo } }, select: { amount: true, date: true } }),
      this.prisma.lead.findMany({ where: { ...bw, createdAt: { gte: yearAgo } }, select: { createdAt: true } }),
    ]);

    const seasonality = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const mIncome = allPayments.filter(p => p.date.getMonth() + 1 === month).reduce((s, p) => s + Number(p.amount), 0);
      const mExpense = allExpenses.filter(e => e.date.getMonth() + 1 === month).reduce((s, e) => s + Number(e.amount), 0);
      const mLeads = allLeads.filter(l => l.createdAt.getMonth() + 1 === month).length;
      return { month, avgIncome: mIncome, avgExpense: mExpense, avgLeads: mLeads };
    });

    return {
      expensesByCategory: expByCat.map(e => ({ category: e.category, amount: Number(e._sum.amount || 0) })),
      expenseBreakdown,
      paymentsByMethod: payByMethod.map(p => ({ method: p.method, amount: Number(p._sum.amount || 0), count: p._count })),
      debtors: { count: debtorStudents.length, totalDebt, avgDebt: debtorStudents.length ? Math.round(totalDebt / debtorStudents.length) : 0, maxDebt: debtorStudents.length ? Math.abs(Number(debtorStudents[0].balance)) : 0 },
      aging,
      breakEven: { monthlyExpense: exp, revenuePerStudent, breakEvenStudents, activeStudents },
      cashFlow: cashFlowWithCumulative,
      seasonality: seasonality.filter(s => s.avgIncome > 0 || s.avgExpense > 0 || s.avgLeads > 0),
      roomPotential: { total: rooms.reduce((s, r) => s + r.capacity * Number(r.pricePerStudent), 0), rooms: rooms.map(r => ({ room: r.room?.name || '', branch: r.branch.name, capacity: r.capacity, price: Number(r.pricePerStudent), potential: r.capacity * Number(r.pricePerStudent) })) },
    };
  }

  // ═══════════════════════════════════════════════
  // ACTIVITY FEED
  // ═══════════════════════════════════════════════

  async getActivityFeed(branchId?: number, limit = 20) {
    const bw = this.bw(branchId);
    const [payments, leads, problems] = await Promise.all([
      this.prisma.payment.findMany({ where: bw, include: { student: { include: { user: { select: { firstName: true, lastName: true } } } }, branch: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: limit }),
      this.prisma.lead.findMany({ where: bw, include: { branch: { select: { name: true } }, course: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: limit }),
      this.prisma.problem.findMany({ where: bw, include: { branch: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    const feed = [
      ...payments.map(p => ({ type: 'payment' as const, title: `${p.student.user.firstName} ${p.student.user.lastName || ''}`.trim(), subtitle: `${p.branch.name} — ${p.method}`, amount: Number(p.amount), date: p.createdAt })),
      ...leads.map(l => ({ type: 'lead' as const, title: `${l.firstName} ${l.lastName || ''}`.trim(), subtitle: `${l.branch.name}${l.course ? ' — ' + l.course.name : ''}`, status: l.status, date: l.createdAt })),
      ...problems.map(p => ({ type: 'problem' as const, title: p.type, subtitle: `${p.branch.name} — ${p.issue.substring(0, 50)}`, status: p.status, date: p.createdAt })),
    ];
    return feed.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
  }

  // ═══════════════════════════════════════════════
  // MANAGER ACCOUNTABILITY
  // ═══════════════════════════════════════════════

  async getManagerAccountability(params: FilterParams) {
    const { current } = this.parseFilter(params);
    const managers = await this.prisma.user.findMany({
      where: { role: { in: ['MANAGER', 'ADMIN'] }, isActive: true },
      include: { branches: { include: { branch: { select: { id: true, name: true } } } } },
    });

    return Promise.all(managers.map(async (mgr) => {
      const mgrBranches = mgr.branches.map(b => b.branchId);
      const bf = params.branchId ? { branchId: params.branchId } : mgrBranches.length ? { branchId: { in: mgrBranches } } : {};
      const [payments, leads, problems] = await Promise.all([
        this.prisma.payment.count({ where: { ...bf, createdById: mgr.id, date: { gte: current.start } } }),
        this.prisma.lead.count({ where: { ...bf, assignedToId: mgr.id, createdAt: { gte: current.start } } }),
        this.prisma.problem.count({ where: { ...bf, reportedBy: mgr.id, createdAt: { gte: current.start } } }),
      ]);
      return { id: mgr.id, name: `${mgr.firstName} ${mgr.lastName}`, branches: mgr.branches.map(b => b.branch.name), actions: { payments, leads, problems, total: payments + leads + problems } };
    })).then(r => r.sort((a, b) => b.actions.total - a.actions.total));
  }

  // ═══════════════════════════════════════════════
  // HR ANALYTICS
  // ═══════════════════════════════════════════════

  async getHrAnalytics(branchId?: number) {
    const bw = this.bw(branchId);
    const now = new Date();

    const [totalActive, byCategory, allStaff] = await Promise.all([
      this.prisma.hrStaff.count({ where: { ...bw, status: 'ACTIVE' } }),
      this.prisma.hrStaff.groupBy({ by: ['category'], where: { ...bw, status: 'ACTIVE' }, _count: true }),
      this.prisma.hrStaff.findMany({ where: { ...bw, status: 'ACTIVE' }, select: { startDate: true, branchId: true, branch: { select: { name: true } } } }),
    ]);

    // Monthly hires (last 12 months)
    const monthlyHires: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ms = new Date(d.getFullYear(), d.getMonth(), 1);
      const me = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const count = allStaff.filter(s => s.startDate && s.startDate >= ms && s.startDate <= me).length;
      monthlyHires.push({ month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, count });
    }

    // By branch
    const branchMap: Record<string, number> = {};
    allStaff.forEach(s => {
      const name = s.branch?.name || 'Boshqa';
      branchMap[name] = (branchMap[name] || 0) + 1;
    });
    const byBranch = Object.entries(branchMap).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);

    return {
      total: totalActive,
      byCategory: byCategory.map(c => ({ category: c.category || 'Boshqa', count: c._count })),
      monthlyHires,
      byBranch,
    };
  }

  // ═══════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════

  private async getAttendanceRate(start: Date, end: Date, branchId?: number): Promise<number> {
    const where: any = { date: { gte: start, lte: end } };
    if (branchId) where.group = { branchId };
    const records = await this.prisma.attendance.findMany({ where, select: { status: true } });
    if (!records.length) return 0;
    return Math.round((records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length / records.length) * 100);
  }

  private growthRate(cur: number, prev: number): number {
    if (!prev || prev === 0) return cur > 0 ? 100 : 0;
    return Math.round((cur - prev) / Math.abs(prev) * 100);
  }
}
