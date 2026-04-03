import { Update, Ctx, Start, Help, Command, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Logger } from '@nestjs/common';
import { BotService } from './bot.service';

@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId) return;

    const user = await this.botService.validateUser(telegramId);
    if (!user) {
      await ctx.reply('Sizda botdan foydalanish huquqi yo\'q. Admin bilan bog\'laning.');
      return;
    }

    await ctx.reply(
      `Assalomu alaykum, ${user.name}! CRMPro botiga xush kelibsiz.\n\n` +
        `Buyruqlar:\n` +
        `/menu — Asosiy menyu\n` +
        `/report — Kunlik hisobot\n` +
        `/help — Yordam`,
    );
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await ctx.reply(
      `CRMPro Bot buyruqlari:\n\n` +
        `/menu — Asosiy menyu\n` +
        `/report — Kunlik hisobot\n` +
        `/leads — Leadlar kiritish\n` +
        `/finance — Moliya kiritish\n` +
        `/attendance — Davomat\n` +
        `/problems — Muammolar\n` +
        `/ai — AI tahlil\n` +
        `/settings — Sozlamalar`,
    );
  }

  @Command('menu')
  async onMenu(@Ctx() ctx: Context) {
    // TODO: Phase 3 da to'liq implement qilinadi
    await ctx.reply('Asosiy menyu — Phase 3 da implement qilinadi', {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📊 Leadlar', callback_data: 'section:leads' },
            { text: '💰 Moliya', callback_data: 'section:finance' },
          ],
          [
            { text: '📋 Davomat', callback_data: 'section:attendance' },
            { text: '💳 Qarzdorlar', callback_data: 'section:debtors' },
          ],
          [
            { text: '⚠️ Muammolar', callback_data: 'section:problems' },
            { text: '📈 Hisobot', callback_data: 'section:report' },
          ],
          [{ text: '🤖 AI Tahlil', callback_data: 'section:ai' }],
        ],
      },
    });
  }
}
