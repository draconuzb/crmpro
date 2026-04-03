import { Scenes, Markup } from 'telegraf';
import { ApiClientService } from '../api-client.service';
import { t, Lang } from '../i18n';

export function createProblemsScene(apiClient: ApiClientService) {
  const scene = new Scenes.WizardScene<any>(
    'problems',
    // Step 1: Problem type
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      const types = lang.problems.types;
      await ctx.reply(lang.problems.selectType, Markup.inlineKeyboard([
        [Markup.button.callback(types.equipment, 'prob_equipment')],
        [Markup.button.callback(types.facility, 'prob_facility')],
        [Markup.button.callback(types.staff, 'prob_staff')],
        [Markup.button.callback(types.student, 'prob_student')],
        [Markup.button.callback(types.finance, 'prob_finance')],
        [Markup.button.callback(types.other, 'prob_other')],
      ]));
      return ctx.wizard.next();
    },
    // Step 2: Issue description (after callback sets type)
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      await ctx.reply(lang.problems.enterIssue);
      return ctx.wizard.next();
    },
    // Step 3: Save
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      const issue = ctx.message?.text?.trim();
      if (!issue) {
        await ctx.reply(lang.problems.enterIssue);
        return;
      }

      try {
        const branchId = ctx.session?.branchId || 1;
        apiClient.setBranchId(branchId);

        await apiClient.post('/problems', {
          type: ctx.wizard.state.problemType || 'other',
          issue,
        });

        await ctx.reply(lang.problems.success);
      } catch (e) {
        await ctx.reply(lang.error);
      }
      return ctx.scene.leave();
    },
  );

  // Handle type selection callbacks
  const problemTypes = ['equipment', 'facility', 'staff', 'student', 'finance', 'other'];
  for (const type of problemTypes) {
    scene.action(`prob_${type}`, async (ctx) => {
      ctx.wizard.state.problemType = type;
      await ctx.answerCbQuery();
      ctx.wizard.selectStep(1);
      return ctx.wizard.steps[1](ctx);
    });
  }

  scene.command('cancel', async (ctx) => {
    const lang = t(ctx.session?.lang as Lang);
    await ctx.reply(lang.cancelled);
    return ctx.scene.leave();
  });

  return scene;
}
