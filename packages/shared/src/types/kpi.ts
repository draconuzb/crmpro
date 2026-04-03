export interface KpiTarget {
  id: number;
  branchId: number;
  metric: string;
  month: string;
  targetValue: number;
  createdAt: string;
}

export interface KpiAssignment {
  id: number;
  branchId: number;
  month: string;
  metric: string;
  targetValue: number;
  direction: 'up' | 'down';
  assignedToId: number;
  assignedById: number;
  createdAt: string;
}

export interface KpiProgress {
  metric: string;
  targetValue: number;
  actualValue: number;
  progressPercent: number;
  direction: 'up' | 'down';
}

export type KpiMetric =
  | 'leads'
  | 'enrollments'
  | 'revenue'
  | 'attendance_rate'
  | 'debtors'
  | 'problems_resolved';

export const KPI_METRIC_LABELS: Record<KpiMetric, { uz: string; ru: string; en: string }> = {
  leads: { uz: 'Leadlar', ru: 'Лиды', en: 'Leads' },
  enrollments: { uz: "Ro'yxatga olish", ru: 'Зачисления', en: 'Enrollments' },
  revenue: { uz: 'Daromad', ru: 'Доход', en: 'Revenue' },
  attendance_rate: { uz: 'Davomat', ru: 'Посещаемость', en: 'Attendance Rate' },
  debtors: { uz: 'Qarzdorlar', ru: 'Должники', en: 'Debtors' },
  problems_resolved: { uz: 'Hal qilingan muammolar', ru: 'Решённые проблемы', en: 'Problems Resolved' },
};
