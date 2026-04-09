import { Scenes, Markup } from 'telegraf';
import { ApiClientService } from '../api-client.service';
import { t, Lang } from '../i18n';

export function createFinanceScene(apiClient: ApiClientService) {
  const scene = new Scenes.WizardScene<any>(
    'finance',
    // Step 1: Income or Expense
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      await ctx.reply(lang.finance.selectType, Markup.inlineKeyboard([
        [Markup.button.callback(lang.finance.income, 'fin_income')],
        [Markup.button.callback(lang.finance.expense, 'fin_expense')],
        [Markup.button.callback(lang.cancel, 'fin_cancel')],
      ]));
      return ctx.wizard.next();
    },
    // Step 2: Category (cash/bank)
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      // This step handles callback from step 1
      await ctx.reply(lang.finance.selectCategory, Markup.inlineKeyboard([
        [Markup.button.callback(lang.finance.cash, 'cat_cash')],
        [Markup.button.callback(lang.finance.bank, 'cat_bank')],
      ]));
      return ctx.wizard.next();
    },
    // Step 3: Amount
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      await ctx.reply(lang.finance.enterAmount);
      return ctx.wizard.next();
    },
    // Step 4: Comment & Save
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      const amount = parseInt(ctx.message?.text?.replace(/\s/g, ''));
      if (isNaN(amount) || amount <= 0) {
        await ctx.reply(lang.finance.invalidAmount);
        return;
      }

      ctx.wizard.state.amount = amount;
      await ctx.reply(lang.finance.enterComment);
      return ctx.wizard.next();
    },
    // Step 5: Save
    async (ctx) => {
      const lang = t(ctx.session?.lang as Lang);
      const comment = ctx.message?.text === '/skip' ? '' : ctx.message?.text || '';

      try {
        const branchId = ctx.session?.branchId || 1;
        apiClient.setBranchId(branchId);

        const type = ctx.wizard.state.type || 'income';
        const category = ctx.wizard.state.category || 'cash';
        const amount = ctx.wizard.state.amount;
        const formattedAmount = amount.toLocaleString();

        await apiClient.post('/daily-reports', {
          date: new Date().toISOString().slice(0, 10),
          section: 'finance',
          data: { type, category, amount, comment },
          source: 'bot',
        });

        const msg = type === 'income'
          ? lang.finance.incomeSuccess(formattedAmount, category)
          : lang.finance.expenseSuccess(formattedAmount, category);
        await ctx.reply(msg);
      } catch (e) {
        await ctx.reply(lang.error);
      }
      return ctx.scene.leave();
    },
  );

  // Handle callbacks
  scene.action('fin_income', async (ctx) => {
    ctx.wizard.state.type = 'income';
    await ctx.answerCbQuery();
    ctx.wizard.selectStep(1);
    return ctx.wizard.steps[1](ctx);
  });

  scene.action('fin_expense', async (ctx) => {
    ctx.wizard.state.type = 'expense';
    await ctx.answerCbQuery();
    ctx.wizard.selectStep(1);
    return ctx.wizard.steps[1](ctx);
  });

  scene.action('cat_cash', async (ctx) => {
    ctx.wizard.state.category = 'cash';
    await ctx.answerCbQuery();
    ctx.wizard.selectStep(2);
    return ctx.wizard.steps[2](ctx);
  });

  scene.action('cat_bank', async (ctx) => {
    ctx.wizard.state.category = 'bank';
    await ctx.answerCbQuery();
    ctx.wizard.selectStep(2);
    return ctx.wizard.steps[2](ctx);
  });

  scene.action('fin_cancel', async (ctx) => {
    const lang = t(ctx.session?.lang as Lang);
    await ctx.answerCbQuery();
    await ctx.reply(lang.cancelled);
    return ctx.scene.leave();
  });

  scene.command('cancel', async (ctx) => {
    const lang = t(ctx.session?.lang as Lang);
    await ctx.reply(lang.cancelled);
    return ctx.scene.leave();
  });

  return scene;
}
