import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDailyReportDto, QueryDailyReportDto } from './dto/create-daily-report.dto';

@Injectable()
export class DailyReportService {
  constructor(private prisma: PrismaService) {}

  async getReports(branchId: number, query: QueryDailyReportDto) {
    const where: any = { branchId };

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }
    if (query.section) where.section = query.section;
    if (query.source) where.source = query.source;

    return this.prisma.dailyReport.findMany({
      where,
      orderBy: [{ date: 'desc' }, { section: 'asc' }],
    });
  }

  async createReport(branchId: number, dto: CreateDailyReportDto, userId?: number) {
    return this.prisma.dailyReport.create({
      data: {
        branchId,
        date: new Date(dto.date),
        section: dto.section,
        data: dto.data,
        source: dto.source || 'manual',
        reportedBy: userId,
      },
    });
  }

  async getSummary(branchId: number, date: string) {
    const reports = await this.prisma.dailyReport.findMany({
      where: {
        branchId,
        date: new Date(date),
      },
      orderBy: { section: 'asc' },
    });

    const summary: Record<string, any> = {};
    for (const r of reports) {
      if (!summary[r.section]) {
        summary[r.section] = [];
      }
      summary[r.section].push(r.data);
    }

    return { date, summary };
  }

  async deleteReport(id: number) {
    return this.prisma.dailyReport.delete({ where: { id } });
  }
}
