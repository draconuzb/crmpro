export interface Teacher {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string | null;
  bio: string | null;
  groupsCount: number;
  createdAt: string;
}

export interface TeacherSalary {
  id: number;
  groupName: string;
  courseName: string;
  studentsCount: number;
  totalLessons: number;
  attended: number;
  absent: number;
  fixedAmount: number;
  calculatedAmount: number;
}

export interface CreateTeacherDto {
  phone: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
  password: string;
  bio?: string;
}
