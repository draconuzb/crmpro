import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private prisma: PrismaService) {}

  async generateDailyPdf(branchId: number, date: string): Promise<Buffer> {
    const data = await this.gatherDailyData(branchId, date);
    return this.buildPdf(`Kunlik hisobot — ${date}`, data);
  }

  async generateWeeklyPdf(branchId: number, startDate: string, endDate: string): Promise<Buffer> {
    const data = await this.gatherPeriodData(branchId, startDate, endDate);
    return this.buildPdf(`Haftalik hisobot — ${startDate} / ${endDate}`, data);
  }

  async generateMonthlyPdf(branchId: number, month: string): Promise<Buffer> {
    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1).toISOString().slice(0, 10);
    const endDate = new Date(year, mon, 0).toISOString().slice(0, 10);
    const data = await this.gatherPeriodData(branchId, startDate, endDate);
    return this.buildPdf(`Oylik hisobot — ${month}`, data);
  }

  private async gatherDailyData(branchId: number, date: string) {
    const d = new Date(date);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    const [leads, payments, expenses, attendance, debtors, problems] = await Promise.all([
      this.prisma.lead.count({
        where: { branchId, createdAt: { gte: d, lt: nextDay } },
      }),
      this.prisma.payment.aggregate({
        where: { branchId, date: { gte: d, lt: nextDay } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.expense.aggregate({
        where: { branchId, date: { gte: d, lt: nextDay } },
        _sum: { amount: true },
      }),
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: { group: { branchId }, date: { gte: d, lt: nextDay } },
        _count: true,
      }),
      this.prisma.student.count({
        where: { branchId, isArchived: false, balance: { lt: 0 } },
      }),
      this.prisma.problem.count({
        where: { branchId, status: 'open' },
      }),
    ]);

    return [
      { label: 'Yangi leadlar', value: leads },
      { label: "To'lovlar soni", value: payments._count },
      { label: 'Daromad', value: `${Number(payments._sum.amount || 0).toLocaleString()} UZS` },
      { label: 'Xarajatlar', value: `${Number(expenses._sum.amount || 0).toLocaleString()} UZS` },
      { label: 'Davomat', value: attendance.map((a) => `${a.status}: ${a._count}`).join(', ') || 'Ma\'lumot yo\'q' },
      { label: 'Qarzdorlar', value: debtors },
      { label: 'Ochiq muammolar', value: problems },
    ];
  }

  private async gatherPeriodData(branchId: number, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);

    const [leads, payments, expenses, attendance, debtors] = await Promise.all([
      this.prisma.lead.count({
        where: { branchId, createdAt: { gte: start, lte: end } },
      }),
      this.prisma.payment.aggregate({
        where: { branchId, date: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.expense.aggregate({
        where: { branchId, date: { gte: start, lte: end } },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: { group: { branchId }, date: { gte: start, lte: end } },
        _count: true,
      }),
      this.prisma.student.count({
        where: { branchId, isArchived: false, balance: { lt: 0 } },
      }),
    ]);

    const revenue = Number(payments._sum.amount || 0);
    const expenseTotal = Number(expenses._sum.amount || 0);

    return [
      { label: 'Yangi leadlar', value: leads },
      { label: "To'lovlar soni", value: payments._count },
      { label: 'Jami daromad', value: `${revenue.toLocaleString()} UZS` },
      { label: 'Xarajatlar soni', value: expenses._count },
      { label: 'Jami xarajat', value: `${expenseTotal.toLocaleString()} UZS` },
      { label: 'Sof foyda', value: `${(revenue - expenseTotal).toLocaleString()} UZS` },
      { label: 'Davomat', value: attendance.map((a) => `${a.status}: ${a._count}`).join(', ') || 'Ma\'lumot yo\'q' },
      { label: 'Qarzdorlar', value: debtors },
    ];
  }

  private buildPdf(title: string, rows: { label: string; value: any }[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('CRMPro', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).text(title, { align: 'center' });
      doc.moveDown();

      // Line
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Table rows
      for (const row of rows) {
        doc.fontSize(11).text(`${row.label}:`, 50, doc.y, { continued: true, width: 200 });
        doc.text(`  ${row.value}`, { align: 'right' });
        doc.moveDown(0.3);
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(9).fillColor('#888').text(
        `Yaratilgan: ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`,
        { align: 'center' },
      );

      doc.end();
    });
  }
}
