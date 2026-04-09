export interface HrStaffMember {
  id: number;
  branchId: number;
  name: string;
  phone?: string;
  category?: string;
  position?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  notes?: string;
}

export interface HrGoalItem {
  id: number;
  branchId: number;
  category?: string;
  subject?: string;
  title: string;
  description?: string;
  deadline?: string;
  status: string;
}
