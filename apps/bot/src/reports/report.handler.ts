import { Injectable, Logger } from '@nestjs/common';
import { ApiClientService } from '../api-client.service';
import { t, Lang } from '../i18n';
import { Context } from 'telegraf';

@Injectable()
export class ReportHandler {
  private readonly logger = new Logger(ReportHandler.name);

  constructor(private readonly apiClient: ApiClientService) {}

  async sendDailyReport(ctx: Context, branchId: number, lang: Lang = 'uz') {
    const i = t(lang);
    await ctx.reply(i.reports.generating);

    try {
      this.apiClient.setBranchId(branchId);
      const today = new Date().toISOString().slice(0, 10);
      const summary = await this.apiClient.get('/daily-reports/summary', { date: today });

      if (!summary?.summary || Object.keys(summary.summary).length === 0) {
        await ctx.reply(i.reports.noData);
        return;
      }

      let text = `📊 *Kunlik hisobot — ${today}*\n\n`;

      for (const [section, entries] of Object.entries(summary.summary) as [string, any[]][]) {
        const sectionLabel = (i.sections as any)[section] || section;
        text += `*${sectionLabel}*\n`;
        for (const entry of entries) {
          const details = Object.entries(entry)
            .map(([k, v]) => `  ${k}: ${v}`)
            .join('\n');
          text += `${details}\n`;
        }
        text += '\n';
      }

      await ctx.reply(text, { parse_mode: 'Markdown' });
    } catch (e) {
      this.logger.error('Failed to send daily report', e);
      await ctx.reply(i.error);
    }
  }

  async sendDailyPdf(ctx: Context, branchId: number) {
    try {
      this.apiClient.setBranchId(branchId);
      const today = new Date().toISOString().slice(0, 10);

      const buffer = await this.apiClient.get(`/reports/pdf/daily?date=${today}`, undefined);

      await ctx.replyWithDocument({
        source: Buffer.from(buffer),
        filename: `daily-report-${today}.pdf`,
      });
    } catch (e) {
      this.logger.error('Failed to send PDF report', e);
      const i = t('uz');
      await ctx.reply(i.error);
    }
  }

  async sendAiAnalysis(ctx: Context, branchId: number, lang: Lang = 'uz') {
    const i = t(lang);
    await ctx.reply(i.ai.analyzing);

    try {
      this.apiClient.setBranchId(branchId);
      const today = new Date().toISOString().slice(0, 10);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const result = await this.apiClient.post('/ai/analyze', {
        reportType: 'weekly',
        startDate: weekAgo,
        endDate: today,
      });

      await ctx.reply(`🤖 *AI Tahlil*\n\n${result.analysis}`, { parse_mode: 'Markdown' });
    } catch (e) {
      this.logger.error('Failed AI analysis', e);
      await ctx.reply(i.error);
    }
  }

  async askAi(ctx: Context, question: string, branchId: number) {
    const i = t('uz');
    try {
      this.apiClient.setBranchId(branchId);
      const result = await this.apiClient.post('/ai/ask', { question });
      await ctx.reply(`🤖 ${result.answer}`);
    } catch (e) {
      this.logger.error('Failed AI ask', e);
      await ctx.reply(i.error);
    }
  }
}
