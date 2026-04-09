import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context, Scenes, session } from 'telegraf';
import { ApiClientService } from './api-client.service';
import { createLeadsScene } from './scenes/leads.scene';
import { createFinanceScene } from './scenes/finance.scene';
import { createAttendanceScene } from './scenes/attendance.scene';
import { createDebtorsScene } from './scenes/debtors.scene';
import { createProblemsScene } from './scenes/problems.scene';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly apiClient: ApiClientService,
  ) {}

  async onModuleInit() {
    // Set up scenes
    const stage = new Scenes.Stage([
      createLeadsScene(this.apiClient),
      createFinanceScene(this.apiClient),
      createAttendanceScene(this.apiClient),
      createDebtorsScene(this.apiClient),
      createProblemsScene(this.apiClient),
    ] as any);

    this.bot.use(session());
    this.bot.use(stage.middleware() as any);

    // Authenticate bot with API
    await this.apiClient.authenticate();

    this.logger.log('Bot scenes and middleware initialized');
  }

  async validateUser(telegramId: string) {
    try {
      const user = await this.apiClient.get(`/users/telegram/${telegramId}`);
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        telegramLang: user.telegramLang || 'uz',
        branches: user.branches || [],
        botSections: user.botSections || [],
      };
    } catch {
      this.logger.warn(`Unauthorized Telegram user: ${telegramId}`);
      return null;
    }
  }

  async sendMessageToUser(telegramId: string, message: string, parseMode?: string) {
    try {
      await this.bot.telegram.sendMessage(telegramId, message, {
        parse_mode: parseMode as any,
      });
      return true;
    } catch (e) {
      this.logger.error(`Failed to send message to ${telegramId}`, e);
      return false;
    }
  }
}
