export const uz = {
  welcome: (name: string) => `Assalomu alaykum, ${name}! CRMPro botiga xush kelibsiz.`,
  unauthorized: "Sizda botdan foydalanish huquqi yo'q. Admin bilan bog'laning.",
  menu: 'Asosiy menyu:',
  help: `CRMPro Bot buyruqlari:

/menu — Asosiy menyu
/report — Kunlik hisobot
/leads — Leadlar kiritish
/finance — Moliya kiritish
/debtors — Qarzdorlar
/attendance — Davomat
/problems — Muammolar
/ai — AI tahlil
/settings — Sozlamalar`,

  // Sections
  sections: {
    leads: '📊 Leadlar',
    finance: '💰 Moliya',
    attendance: '📋 Davomat',
    debtors: '💳 Qarzdorlar',
    problems: '⚠️ Muammolar',
    rejections: '❌ Rad etilganlar',
    empty_rooms: '🚪 Bo\'sh xonalar',
    reports: '📈 Hisobotlar',
    ai: '🤖 AI Tahlil',
  },

  // Leads
  leads: {
    title: 'Leadlar kiritish',
    enterSubject: "Fan nomini kiriting (masalan: English):",
    enterCount: "Nechta lead qo'shildi?",
    success: (count: number, subject: string) => `✅ ${count} ta lead (${subject}) kiritildi!`,
    invalid: "Noto'g'ri son. Qaytadan kiriting:",
  },

  // Finance
  finance: {
    title: 'Moliya kiritish',
    selectType: "Turini tanlang:",
    income: '💰 Daromad',
    expense: '💸 Xarajat',
    selectCategory: 'Kategoriyani tanlang:',
    cash: 'Naqd',
    bank: 'Bank',
    enterAmount: "Summani kiriting (so'mda):",
    enterComment: 'Izoh kiriting (yoki /skip):',
    incomeSuccess: (amount: string, cat: string) => `✅ Daromad kiritildi: ${amount} UZS (${cat})`,
    expenseSuccess: (amount: string, cat: string) => `✅ Xarajat kiritildi: ${amount} UZS (${cat})`,
    invalidAmount: "Noto'g'ri summa. Qaytadan kiriting:",
  },

  // Attendance
  attendance: {
    title: 'Davomat kiritish',
    enterExpected: "Kutilgan o'quvchilar soni:",
    enterAttended: "Kelgan o'quvchilar soni:",
    success: (attended: number, expected: number) =>
      `✅ Davomat: ${attended}/${expected} (${Math.round((attended / expected) * 100)}%)`,
  },

  // Debtors
  debtors: {
    title: 'Qarzdorlar',
    enterMonth: "Oyni kiriting (masalan: 2026-04):",
    enterCount: 'Qarzdorlar soni:',
    enterAmount: "Jami qarz summasi (so'mda):",
    success: (count: number, amount: string) => `✅ Qarzdorlar: ${count} ta, jami: ${amount} UZS`,
  },

  // Problems
  problems: {
    title: 'Muammo kiritish',
    selectType: 'Muammo turini tanlang:',
    types: {
      equipment: '🔧 Jihozlar',
      facility: '🏢 Bino',
      staff: '👤 Xodimlar',
      student: '🎓 O\'quvchilar',
      finance: '💰 Moliya',
      other: '📌 Boshqa',
    },
    enterIssue: 'Muammoni tasvirlab bering:',
    success: "✅ Muammo qayd etildi!",
  },

  // Reports
  reports: {
    title: 'Hisobotlar',
    daily: '📅 Kunlik',
    weekly: '📆 Haftalik',
    monthly: '🗓 Oylik',
    generating: 'Hisobot tayyorlanmoqda...',
    noData: "Bu davr uchun ma'lumot topilmadi.",
  },

  // AI
  ai: {
    title: 'AI Tahlil',
    analyze: '📊 Tahlil qilish',
    anomalies: '🔍 Anomaliyalar',
    ask: '❓ Savol berish',
    enterQuestion: 'Savolingizni kiriting:',
    analyzing: 'AI tahlil qilmoqda...',
  },

  // Common
  cancel: '❌ Bekor qilish',
  back: '⬅️ Orqaga',
  skip: "O'tkazib yuborish",
  done: '✅ Tayyor',
  error: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.',
  cancelled: 'Bekor qilindi.',
  noPermission: "Sizda bu bo'lim uchun ruxsat yo'q.",
};
