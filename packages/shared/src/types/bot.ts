export type BotSection =
  | 'leads'
  | 'debtors'
  | 'rejections'
  | 'finance'
  | 'attendance'
  | 'problems'
  | 'empty_rooms'
  | 'reports'
  | 'users'
  | 'cron'
  | 'dashboard'
  | 'analysis';

export const BOT_SECTION_LABELS: Record<BotSection, { uz: string; ru: string }> = {
  leads: { uz: 'Leadlar', ru: 'Лиды' },
  debtors: { uz: 'Qarzdorlar', ru: 'Должники' },
  rejections: { uz: 'Rad etilganlar', ru: 'Отказы' },
  finance: { uz: 'Moliya', ru: 'Финансы' },
  attendance: { uz: 'Davomat', ru: 'Посещаемость' },
  problems: { uz: 'Muammolar', ru: 'Проблемы' },
  empty_rooms: { uz: "Bo'sh xonalar", ru: 'Пустые классы' },
  reports: { uz: 'Hisobotlar', ru: 'Отчёты' },
  users: { uz: 'Foydalanuvchilar', ru: 'Пользователи' },
  cron: { uz: 'Cron vazifalar', ru: 'Задачи Cron' },
  dashboard: { uz: 'Dashboard', ru: 'Панель' },
  analysis: { uz: 'Tahlil', ru: 'Анализ' },
};

export interface DailyReportEntry {
  id: number;
  branchId: number;
  date: string;
  section: BotSection;
  data: Record<string, any>;
  reportedBy?: number;
  source: 'manual' | 'crm-sync' | 'bot';
  createdAt: string;
}

export interface CronJobConfig {
  id: number;
  key: string;
  label: string;
  schedule: string;
  enabled: boolean;
  type: 'message' | 'report';
  message?: string;
  sections?: string;
  assignedTo?: number[];
}
