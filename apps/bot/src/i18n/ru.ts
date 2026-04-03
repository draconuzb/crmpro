export const ru = {
  welcome: (name: string) => `Здравствуйте, ${name}! Добро пожаловать в CRMPro бот.`,
  unauthorized: 'У вас нет доступа к боту. Свяжитесь с администратором.',
  menu: 'Главное меню:',
  help: `Команды CRMPro бота:

/menu — Главное меню
/report — Дневной отчёт
/leads — Ввод лидов
/finance — Финансы
/debtors — Должники
/attendance — Посещаемость
/problems — Проблемы
/ai — AI анализ
/settings — Настройки`,

  sections: {
    leads: '📊 Лиды',
    finance: '💰 Финансы',
    attendance: '📋 Посещаемость',
    debtors: '💳 Должники',
    problems: '⚠️ Проблемы',
    rejections: '❌ Отказы',
    empty_rooms: '🚪 Пустые классы',
    reports: '📈 Отчёты',
    ai: '🤖 AI Анализ',
  },

  leads: {
    title: 'Ввод лидов',
    enterSubject: 'Введите название курса (например: English):',
    enterCount: 'Сколько лидов добавлено?',
    success: (count: number, subject: string) => `✅ ${count} лидов (${subject}) добавлено!`,
    invalid: 'Неверное число. Введите ещё раз:',
  },

  finance: {
    title: 'Ввод финансов',
    selectType: 'Выберите тип:',
    income: '💰 Доход',
    expense: '💸 Расход',
    selectCategory: 'Выберите категорию:',
    cash: 'Наличные',
    bank: 'Банк',
    enterAmount: 'Введите сумму (в сумах):',
    enterComment: 'Введите комментарий (или /skip):',
    incomeSuccess: (amount: string, cat: string) => `✅ Доход: ${amount} UZS (${cat})`,
    expenseSuccess: (amount: string, cat: string) => `✅ Расход: ${amount} UZS (${cat})`,
    invalidAmount: 'Неверная сумма. Введите ещё раз:',
  },

  attendance: {
    title: 'Посещаемость',
    enterExpected: 'Ожидаемое кол-во учеников:',
    enterAttended: 'Пришло учеников:',
    success: (attended: number, expected: number) =>
      `✅ Посещаемость: ${attended}/${expected} (${Math.round((attended / expected) * 100)}%)`,
  },

  debtors: {
    title: 'Должники',
    enterMonth: 'Введите месяц (например: 2026-04):',
    enterCount: 'Количество должников:',
    enterAmount: 'Общая сумма долга (в сумах):',
    success: (count: number, amount: string) => `✅ Должники: ${count}, сумма: ${amount} UZS`,
  },

  problems: {
    title: 'Ввод проблемы',
    selectType: 'Выберите тип проблемы:',
    types: {
      equipment: '🔧 Оборудование',
      facility: '🏢 Помещение',
      staff: '👤 Персонал',
      student: '🎓 Ученики',
      finance: '💰 Финансы',
      other: '📌 Другое',
    },
    enterIssue: 'Опишите проблему:',
    success: '✅ Проблема зарегистрирована!',
  },

  reports: {
    title: 'Отчёты',
    daily: '📅 Дневной',
    weekly: '📆 Недельный',
    monthly: '🗓 Месячный',
    generating: 'Отчёт формируется...',
    noData: 'Нет данных за этот период.',
  },

  ai: {
    title: 'AI Анализ',
    analyze: '📊 Анализировать',
    anomalies: '🔍 Аномалии',
    ask: '❓ Задать вопрос',
    enterQuestion: 'Введите ваш вопрос:',
    analyzing: 'AI анализирует...',
  },

  cancel: '❌ Отмена',
  back: '⬅️ Назад',
  skip: 'Пропустить',
  done: '✅ Готово',
  error: 'Произошла ошибка. Попробуйте ещё раз.',
  cancelled: 'Отменено.',
  noPermission: 'У вас нет доступа к этому разделу.',
};
