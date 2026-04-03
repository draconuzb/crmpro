import { Scenes } from 'telegraf';
import { ApiClientService } from '../api-client.service';
import { t, Lang } from '../i18n';

export function createDebtorsScene(apiClient: ApiClientService) {
  const scene = new Scenes.WizardScene<any>(
    'debtors',
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      await ctx.reply(lang.debtors.enterCount);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      const count = parseInt(ctx.message?.text);
      if (isNaN(count) || count < 0) {
        await ctx.reply(lang.debtors.enterCount);
        return;
      }
      ctx.wizard.state.count = count;
      await ctx.reply(lang.debtors.enterAmount);
      return ctx.wizard.next();
    },
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      const amount = parseInt(ctx.message?.text?.replace(/\s/g, ''));
      if (isNaN(amount) || amount < 0) {
        await ctx.reply(lang.debtors.enterAmount);
        return;
      }

      try {
        const branchId = ctx.session?.branchId || 1;
        apiClient.setBranchId(branchId);

        await apiClient.post('/daily-reports', {
          date: new Date().toISOString().slice(0, 10),
          section: 'debtors',
          data: { count: ctx.wizard.state.count, amount },
          source: 'bot',
        });

        await ctx.reply(lang.debtors.success(ctx.wizard.state.count, amount.toLocaleString()));
      } catch (e) {
        await ctx.reply(lang.error);
      }
      return ctx.scene.leave();
    },
  );

  scene.command('cancel', async (ctx) => {
    const lang = t(ctx.session?.lang as Lang);
    await ctx.reply(lang.cancelled);
    return ctx.scene.leave();
  });

  return scene;
}
