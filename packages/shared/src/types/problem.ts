export type ProblemStatus = 'open' | 'in_progress' | 'resolved';

export interface Problem {
  id: number;
  branchId: number;
  type: string;
  issue: string;
  status: ProblemStatus;
  reportedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export const PROBLEM_TYPES = [
  { key: 'equipment', uz: 'Jihozlar', ru: 'Оборудование', en: 'Equipment' },
  { key: 'facility', uz: 'Bino', ru: 'Помещение', en: 'Facility' },
  { key: 'staff', uz: 'Xodimlar', ru: 'Персонал', en: 'Staff' },
  { key: 'student', uz: "O'quvchilar", ru: 'Ученики', en: 'Students' },
  { key: 'finance', uz: 'Moliya', ru: 'Финансы', en: 'Finance' },
  { key: 'other', uz: 'Boshqa', ru: 'Другое', en: 'Other' },
] as const;
