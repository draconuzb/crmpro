import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKpiTargetDto, CreateKpiAssignmentDto, QueryKpiDto } from './dto/create-kpi-target.dto';

@Injectable()
export class KpiService {
  constructor(private prisma: PrismaService) {}

  // ─── TARGETS ────────────────────────────────────────────────────

  async getTargets(branchId: number, query: QueryKpiDto) {
    const where: any = { branchId };
    if (query.month) where.month = query.month;
    if (query.metric) where.metric = query.metric;

    return this.prisma.kpiTarget.findMany({
      where,
      orderBy: [{ month: 'desc' }, { metric: 'asc' }],
    });
  }

  async createTarget(branchId: number, dto: CreateKpiTargetDto) {
    return this.prisma.kpiTarget.upsert({
      where: {
        branchId_metric_month: {
          branchId,
          metric: dto.metric,
          month: dto.month,
        },
      },
      create: {
        branchId,
        metric: dto.metric,
        month: dto.month,
        targetValue: dto.targetValue,
      },
      update: {
        targetValue: dto.targetValue,
      },
    });
  }

  async deleteTarget(id: number) {
    return this.prisma.kpiTarget.delete({ where: { id } });
  }

  // ─── ASSIGNMENTS ────────────────────────────────────────────────

  async getAssignments(branchId: number, query: QueryKpiDto) {
    const where: any = { branchId };
    if (query.month) where.month = query.month;
    if (query.metric) where.metric = query.metric;

    return this.prisma.kpiAssignment.findMany({
      where,
      orderBy: [{ month: 'desc' }, { metric: 'asc' }],
    });
  }

  async createAssignment(branchId: number, dto: CreateKpiAssignmentDto, assignedById: number) {
    return this.prisma.kpiAssignment.upsert({
      where: {
        branchId_month_metric_assignedToId: {
          branchId,
          month: dto.month,
          metric: dto.metric,
          assignedToId: dto.assignedToId,
        },
      },
      create: {
        branchId,
        month: dto.month,
        metric: dto.metric,
        targetValue: dto.targetValue,
        direction: dto.direction || 'up',
        assignedToId: dto.assignedToId,
        assignedById,
      },
      update: {
        targetValue: dto.targetValue,
        direction: dto.direction || 'up',
      },
    });
  }

  async deleteAssignment(id: number) {
    return this.prisma.kpiAssignment.delete({ where: { id } });
  }

  // ─── DASHBOARD ──────────────────────────────────────────────────

  async getDashboard(branchId: number, month: string) {
    const targets = await this.prisma.kpiTarget.findMany({
      where: { branchId, month },
    });

    // Calculate actual values from real data
    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate = new Date(year, mon, 0, 23, 59, 59);

    const [leadsCount, paymentsSum, attendanceData, debtorsCount] = await Promise.all([
      this.prisma.lead.count({
        where: { branchId, createdAt: { gte: startDate, lte: endDate } },
      }),
      this.prisma.payment.aggregate({
        where: { branchId, date: { gte: startDate, lte: endDate } },
        _sum: { amount: true },
      }),
      this.getAttendanceRate(branchId, startDate, endDate),
      this.prisma.student.count({
        where: { branchId, isArchived: false, balance: { lt: 0 } },
      }),
    ]);

    const actuals: Record<string, number> = {
      leads: leadsCount,
      revenue: Number(paymentsSum._sum.amount || 0),
      attendance_rate: attendanceData,
      debtors: debtorsCount,
    };

    return targets.map((t) => {
      const actual = actuals[t.metric] ?? 0;
      const target = Number(t.targetValue);
      const progress = target > 0 ? Math.round((actual / target) * 100) : 0;

      return {
        metric: t.metric,
        targetValue: target,
        actualValue: actual,
        progressPercent: Math.min(progress, 200),
      };
    });
  }

  private async getAttendanceRate(branchId: number, startDate: Date, endDate: Date): Promise<number> {
    const [total, present] = await Promise.all([
      this.prisma.attendance.count({
        where: { group: { branchId }, date: { gte: startDate, lte: endDate } },
      }),
      this.prisma.attendance.count({
        where: {
          group: { branchId },
          date: { gte: startDate, lte: endDate },
          status: 'PRESENT',
        },
      }),
    ]);
    return total > 0 ? Math.round((present / total) * 100) : 0;
  }
}
