export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceRecord {
  id: number;
  groupId: number;
  studentId: number;
  studentName: string;
  date: string;
  status: AttendanceStatus;
  note: string | null;
}

export interface BulkAttendanceDto {
  groupId: number;
  date: string;
  records: { studentId: number; status: AttendanceStatus; note?: string }[];
}

export interface AttendanceReport {
  studentName: string;
  phone: string;
  status: string;
  groupName: string;
  teacherName: string;
  lessonTime: string;
  attendance: AttendanceStatus;
  lastComment: string | null;
}

export interface TeacherAttendanceRecord {
  id: number;
  teacherId: number;
  teacherName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
}
