import { Scenes } from 'telegraf';
import { ApiClientService } from '../api-client.service';
import { t, Lang } from '../i18n';

export function createLeadsScene(apiClient: ApiClientService) {
  const scene = new Scenes.WizardScene<any>(
    'leads',
    // Step 1: Ask subject
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      await ctx.reply(lang.leads.enterSubject);
      return ctx.wizard.next();
    },
    // Step 2: Ask count
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      ctx.wizard.state.subject = ctx.message?.text?.trim();
      if (!ctx.wizard.state.subject) {
        await ctx.reply(lang.leads.enterSubject);
        return;
      }
      await ctx.reply(lang.leads.enterCount);
      return ctx.wizard.next();
    },
    // Step 3: Save
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      const count = parseInt(ctx.message?.text);
      if (isNaN(count) || count <= 0) {
        await ctx.reply(lang.leads.invalid);
        return;
      }

      try {
        const branchId = ctx.session?.branchId || 1;
        apiClient.setBranchId(branchId);

        await apiClient.post('/daily-reports', {
          date: new Date().toISOString().slice(0, 10),
          section: 'leads',
          data: { count, subject: ctx.wizard.state.subject },
          source: 'bot',
        });

        await ctx.reply(lang.leads.success(count, ctx.wizard.state.subject));
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
