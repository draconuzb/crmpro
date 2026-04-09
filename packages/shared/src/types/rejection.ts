export interface RejectionReason {
  id: number;
  branchId: number;
  label: string;
  sortOrder: number;
  isActive: boolean;
}

export interface StudentDeparture {
  id: number;
  branchId: number;
  studentId: number;
  type: string;
  reasonId: number;
  note?: string;
  groupId?: number;
  teacherId?: number;
  courseId?: number;
  departureDate: string;
  createdById: number;
}

export interface LeadDeletion {
  id: number;
  branchId: number;
  leadId: number;
  firstName: string;
  lastName?: string;
  phone?: string;
  reasonId: number;
  note?: string;
  source?: string;
  courseId?: number;
  deletedById: number;
}
