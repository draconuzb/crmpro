export type StaffStatus = 'ACTIVE' | 'INACTIVE' | 'DISMISSED';

export interface HrStaff {
  id: number;
  branchId: number;
  name: string;
  phone?: string;
  category?: string;
  position?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
  status: StaffStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type GoalStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface HrGoal {
  id: number;
  branchId: number;
  category?: string;
  subject?: string;
  title: string;
  description?: string;
  deadline?: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export const STAFF_CATEGORIES = [
  { key: 'teacher', uz: "O'qituvchi", ru: 'Преподаватель', en: 'Teacher' },
  { key: 'admin', uz: 'Administrator', ru: 'Администратор', en: 'Admin' },
  { key: 'support', uz: "Yordamchi xodim", ru: 'Вспомогательный', en: 'Support' },
  { key: 'manager', uz: 'Menejer', ru: 'Менеджер', en: 'Manager' },
] as const;
