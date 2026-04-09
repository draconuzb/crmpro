import { Scenes } from 'telegraf';
import { ApiClientService } from '../api-client.service';
import { t, Lang } from '../i18n';

export function createAttendanceScene(apiClient: ApiClientService) {
  const scene = new Scenes.WizardScene<any>(
    'attendance',
    // Step 1: Expected count
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      await ctx.reply(lang.attendance.enterExpected);
      return ctx.wizard.next();
    },
    // Step 2: Attended count
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      const expected = parseInt(ctx.message?.text);
      if (isNaN(expected) || expected <= 0) {
        await ctx.reply(lang.attendance.enterExpected);
        return;
      }
      ctx.wizard.state.expected = expected;
      await ctx.reply(lang.attendance.enterAttended);
      return ctx.wizard.next();
    },
    // Step 3: Save
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      const attended = parseInt(ctx.message?.text);
      if (isNaN(attended) || attended < 0) {
        await ctx.reply(lang.attendance.enterAttended);
        return;
      }

      try {
        const branchId = ctx.session?.branchId || 1;
        apiClient.setBranchId(branchId);

        await apiClient.post('/daily-reports', {
          date: new Date().toISOString().slice(0, 10),
          section: 'attendance',
          data: { expected: ctx.wizard.state.expected, attended },
          source: 'bot',
        });

        await ctx.reply(lang.attendance.success(attended, ctx.wizard.state.expected));
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
