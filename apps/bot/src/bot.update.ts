import { Update, Ctx, Start, Help, Command, On, Action } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { Logger } from '@nestjs/common';
import { BotService } from './bot.service';
import { ReportHandler } from './reports/report.handler';
import { t, Lang } from './i18n';

@Update()
export class BotUpdate {
  private readonly logger = new Logger(BotUpdate.name);

  constructor(
    private readonly botService: BotService,
    private readonly reportHandler: ReportHandler,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    const telegramId = ctx.from?.id?.toString();
    if (!telegramId) return;

    const user = await this.botService.validateUser(telegramId);
    if (!user) {
      await ctx.reply(t('uz').unauthorized);
      return;
    }

    // Save user info to session
    (ctx as any).session = {
      ...(ctx as any).session,
      userId: user.id,
      userName: user.name,
      role: user.role,
      branchId: user.branches?.[0]?.id || 1,
      lang: user.telegramLang || 'uz',
    };

    const lang = t((user.telegramLang || 'uz') as Lang);
    await ctx.reply(lang.welcome(user.name));
    await this.showMenu(ctx);
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    const lang = this.getLang(ctx);
    await ctx.reply(t(lang).help);
  }

  @Command('menu')
  async onMenu(@Ctx() ctx: Context) {
    await this.showMenu(ctx);
  }

  @Command('leads')
  async onLeads(@Ctx() ctx: Context) {
    await (ctx as any).scene.enter('leads');
  }

  @Command('finance')
  async onFinance(@Ctx() ctx: Context) {
    await (ctx as any).scene.enter('finance');
  }

  @Command('attendance')
  async onAttendance(@Ctx() ctx: Context) {
    await (ctx as any).scene.enter('attendance');
  }

  @Command('debtors')
  async onDebtors(@Ctx() ctx: Context) {
    await (ctx as any).scene.enter('debtors');
  }

  @Command('problems')
  async onProblems(@Ctx() ctx: Context) {
    await (ctx as any).scene.enter('problems');
  }

  @Command('report')
  async onReport(@Ctx() ctx: Context) {
    const lang = this.getLang(ctx);
    const i = t(lang);
    await ctx.reply(i.reports.title, Markup.inlineKeyboard([
      [Markup.button.callback(i.reports.daily, 'report_daily')],
      [Markup.button.callback(i.reports.weekly, 'report_weekly')],
      [Markup.button.callback(i.reports.monthly, 'report_monthly')],
      [Markup.button.callback('📄 PDF', 'report_pdf')],
    ]));
  }

  @Command('ai')
  async onAi(@Ctx() ctx: Context) {
    const lang = this.getLang(ctx);
    const i = t(lang);
    await ctx.reply(i.ai.title, Markup.inlineKeyboard([
      [Markup.button.callback(i.ai.analyze, 'ai_analyze')],
      [Markup.button.callback(i.ai.anomalies, 'ai_anomalies')],
      [Markup.button.callback(i.ai.ask, 'ai_ask')],
    ]));
  }

  // ─── CALLBACK HANDLERS ─────────────────────────────────────

  @Action(/^section:(.+)$/)
  async onSectionSelect(@Ctx() ctx: any) {
    const section = ctx.match[1];
    await ctx.answerCbQuery();
    switch (section) {
      case 'leads': return ctx.scene.enter('leads');
      case 'finance': return ctx.scene.enter('finance');
      case 'attendance': return ctx.scene.enter('attendance');
      case 'debtors': return ctx.scene.enter('debtors');
      case 'problems': return ctx.scene.enter('problems');
      case 'report': return this.onReport(ctx);
      case 'ai': return this.onAi(ctx);
    }
  }

  @Action('report_daily')
  async onReportDaily(@Ctx() ctx: any) {
    await ctx.answerCbQuery();
    const branchId = ctx.session?.branchId || 1;
    await this.reportHandler.sendDailyReport(ctx, branchId, this.getLang(ctx));
  }

  @Action('report_pdf')
  async onReportPdf(@Ctx() ctx: any) {
    await ctx.answerCbQuery();
    const branchId = ctx.session?.branchId || 1;
    await this.reportHandler.sendDailyPdf(ctx, branchId);
  }

  @Action('ai_analyze')
  async onAiAnalyze(@Ctx() ctx: any) {
    await ctx.answerCbQuery();
    const branchId = ctx.session?.branchId || 1;
    await this.reportHandler.sendAiAnalysis(ctx, branchId, this.getLang(ctx));
  }

  @Action('ai_ask')
  async onAiAsk(@Ctx() ctx: any) {
    await ctx.answerCbQuery();
    const lang = this.getLang(ctx);
    await ctx.reply(t(lang).ai.enterQuestion);
    ctx.session.waitingForAiQuestion = true;
  }

  @On('text')
  async onText(@Ctx() ctx: any) {
    if (ctx.session?.waitingForAiQuestion) {
      ctx.session.waitingForAiQuestion = false;
      const branchId = ctx.session?.branchId || 1;
      await this.reportHandler.askAi(ctx, ctx.message.text, branchId);
    }
  }

  // ─── HELPERS ────────────────────────────────────────────────

  private async showMenu(ctx: Context) {
    const lang = this.getLang(ctx);
    const i = t(lang);
    await ctx.reply(i.menu, Markup.inlineKeyboard([
      [
        Markup.button.callback(i.sections.leads, 'section:leads'),
        Markup.button.callback(i.sections.finance, 'section:finance'),
      ],
      [
        Markup.button.callback(i.sections.attendance, 'section:attendance'),
        Markup.button.callback(i.sections.debtors, 'section:debtors'),
      ],
      [
        Markup.button.callback(i.sections.problems, 'section:problems'),
        Markup.button.callback(i.sections.reports, 'section:report'),
      ],
      [Markup.button.callback(i.sections.ai, 'section:ai')],
    ]));
  }

  private getLang(ctx: Context): Lang {
    return ((ctx as any).session?.lang as Lang) || 'uz';
  }
}
