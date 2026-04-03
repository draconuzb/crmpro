export type LeadStatus = 'LEAD' | 'EXPECTATION' | 'SET';

export interface Lead {
  id: number;
  firstName: string;
  lastName: string | null;
  phone: string;
  status: LeadStatus;
  courseId: number | null;
  source: string | null;
  assignedToId: number | null;
  assignedToName: string | null;
  note: string | null;
  tags: { id: number; name: string; color: string | null }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadDto {
  firstName: string;
  lastName?: string;
  phone: string;
  source?: string;
  courseId?: number;
  note?: string;
}

export interface UpdateLeadStatusDto {
  status: LeadStatus;
}
