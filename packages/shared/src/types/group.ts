export type DayType = 'ODD' | 'EVEN' | 'OTHER';
export type GroupStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';

export interface Group {
  id: number;
  name: string;
  courseId: number;
  courseName: string;
  teacherId: number;
  teacherName: string;
  roomId: number | null;
  roomName: string | null;
  dayType: DayType;
  customDays: string[] | null;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string | null;
  status: GroupStatus;
  studentsCount: number;
  tags: TagInfo[];
  createdAt: string;
}

export interface TagInfo {
  id: number;
  name: string;
  color: string | null;
}

export interface CreateGroupDto {
  name: string;
  courseId: number;
  teacherId: number;
  roomId?: number;
  dayType: DayType;
  customDays?: string[];
  startTime: string;
  endTime?: string;
  startDate: string;
}
