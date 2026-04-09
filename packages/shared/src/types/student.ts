export interface Student {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string | null;
  balance: number;
  coins: number;
  isArchived: boolean;
  createdAt: string;
  groups?: StudentGroup[];
}

export interface StudentGroup {
  id: number;
  groupId: number;
  groupName: string;
  courseName: string;
  teacherName: string;
  price: number;
  status: string;
  startDate: string;
}

export interface CreateStudentDto {
  phone: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  password: string;
  note?: string;
  groupId?: number;
  price?: number;
}

export type StudentStatus = 'ACTIVE' | 'FROZEN' | 'LEFT' | 'TRIAL';
