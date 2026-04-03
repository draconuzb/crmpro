import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiClientService } from '../api-client.service';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';

@Injectable()
export class BotCronService {
  private readonly logger = new Logger(BotCronService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly apiClient: ApiClientService,
  ) {}

  // Daily reminder at 18:00 (Asia/Tashkent = 13:00 UTC)
  @Cron('0 13 * * 1-6')
  async dailyReminder() {
    this.logger.log('Running daily reminder cron');
    try {
      const jobs = await this.apiClient.get('/scheduler/jobs');
      const reminderJob = jobs?.find((j: any) => j.key === 'daily_reminder' && j.enabled);

      if (!reminderJob?.assignedTo?.length) return;

      for (const userId of reminderJob.assignedTo) {
        try {
          const user = await this.apiClient.get(`/users/${userId}`);
          if (user?.telegramId) {
            await this.bot.telegram.sendMessage(
              user.telegramId,
              reminderJob.message || "📝 Bugungi ma'lumotlarni kiritishni unutmang!",
            );
          }
        } catch (e) {
          this.logger.warn(`Failed to send reminder to user ${userId}`);
        }
      }
    } catch (e) {
      this.logger.error('Daily reminder cron failed', e);
    }
  }

  // Daily report at 09:00 (Asia/Tashkent = 04:00 UTC)
  @Cron('0 4 * * *')
  async dailyReport() {
    this.logger.log('Running daily report cron');
    try {
      const ceoTelegramId = process.env.CEO_TELEGRAM_ID;
      if (!ceoTelegramId) return;

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      this.apiClient.setBranchId(1);
      const summary = await this.apiClient.get('/daily-reports/summary', { date: yesterday });

      if (!summary?.summary || Object.keys(summary.summary).length === 0) return;

      let text = `📊 *Kunlik hisobot — ${yesterday}*\n\n`;
      for (const [section, entries] of Object.entries(summary.summary) as [string, any[]][]) {
        text += `*${section}*\n`;
        for (const entry of entries) {
          text += Object.entries(entry).map(([k, v]) => `  ${k}: ${v}`).join('\n') + '\n';
        }
        text += '\n';
      }

      await this.bot.telegram.sendMessage(ceoTelegramId, text, { parse_mode: 'Markdown' });
    } catch (e) {
      this.logger.error('Daily report cron failed', e);
    }
  }

  // Weekly report every Monday at 09:00
  @Cron('0 4 * * 1')
  async weeklyReport() {
    this.logger.log('Running weekly report cron');
    try {
      const ceoTelegramId = process.env.CEO_TELEGRAM_ID;
      if (!ceoTelegramId) return;

      this.apiClient.setBranchId(1);

      const result = await this.apiClient.post('/ai/analyze', {
        reportType: 'weekly',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
      });

      await this.bot.telegram.sendMessage(
        ceoTelegramId,
        `📈 *Haftalik AI tahlil*\n\n${result.analysis}`,
        { parse_mode: 'Markdown' },
      );
    } catch (e) {
      this.logger.error('Weekly report cron failed', e);
    }
  }
}
