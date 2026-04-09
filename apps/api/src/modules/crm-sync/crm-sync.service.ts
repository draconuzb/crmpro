import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CrmSyncService {
  private readonly logger = new Logger(CrmSyncService.name);

  constructor(private prisma: PrismaService) {}

  // Sync CRM data to DailyReport every day at 23:00 Tashkent (18:00 UTC)
  @Cron('0 18 * * *', { name: 'crm-daily-sync' })
  async syncDaily() {
    this.logger.log('Running CRM daily sync...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const branches = await this.prisma.branch.findMany({ where: { isActive: true }, select: { id: true } });

    for (const { id: branchId } of branches) {
      await this.syncBranch(branchId, today, tomorrow);
    }

    await this.prisma.crmSyncState.upsert({
      where: { syncType: 'daily' },
      create: { syncType: 'daily', lastSyncedAt: new Date() },
      update: { lastSyncedAt: new Date() },
    });

    this.logger.log('CRM daily sync completed');
  }

  async syncBranch(branchId: number, dayStart: Date, dayEnd: Date) {
    const [leads, payments, expenses, attendance, debtors] = await Promise.all([
      this.prisma.lead.count({ where: { branchId, createdAt: { gte: dayStart, lt: dayEnd } } }),
      this.prisma.payment.aggregate({
        where: { branchId, date: { gte: dayStart, lt: dayEnd } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.expense.aggregate({
        where: { branchId, date: { gte: dayStart, lt: dayEnd } },
        _sum: { amount: true },
      }),
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: { group: { branchId }, date: { gte: dayStart, lt: dayEnd } },
        _count: true,
      }),
      this.prisma.student.count({ where: { branchId, isArchived: false, balance: { lt: 0 } } }),
    ]);

    const date = dayStart;
    const sections = [
      { section: 'leads', data: { count: leads } },
      {
        section: 'finance',
        data: {
          income: Number(payments._sum.amount || 0),
          paymentCount: payments._count,
          expenses: Number(expenses._sum.amount || 0),
        },
      },
      {
        section: 'attendance',
        data: Object.fromEntries(attendance.map((a) => [a.status, a._count])),
      },
      { section: 'debtors', data: { count: debtors } },
    ];

    for (const { section, data } of sections) {
      await this.prisma.dailyReport.upsert({
        where: {
          branchId_date_section_source: undefined as any,
        },
        create: { branchId, date, section, data, source: 'crm-sync' },
        update: { data, source: 'crm-sync' },
      }).catch(async () => {
        // Fallback: delete old crm-sync entry and create new
        await this.prisma.dailyReport.deleteMany({
          where: { branchId, date, section, source: 'crm-sync' },
        });
        await this.prisma.dailyReport.create({
          data: { branchId, date, section, data, source: 'crm-sync' },
        });
      });
    }
  }

  async getLastSyncState() {
    return this.prisma.crmSyncState.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async triggerManualSync(branchId: number, date: string) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    await this.syncBranch(branchId, dayStart, dayEnd);
    return { synced: true, branchId, date };
  }
}
