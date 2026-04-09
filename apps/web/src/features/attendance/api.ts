import api from '../../lib/axios';

export const bulkMarkAttendance = (data: any) =>
  api.post('/attendance/bulk', data).then((r) => r.data);

export const getAttendanceReport = (params?: any) =>
  api.get('/attendance/report', { params }).then((r) => r.data);

export const getStudentAttendance = (studentId: number, month: number, year: number) =>
  api.get(`/attendance/student/${studentId}`, { params: { month, year } }).then((r) => r.data);

export const getGroupAttendance = (groupId: number, month: number, year: number) =>
  api.get(`/attendance/group/${groupId}`, { params: { month, year } }).then((r) => r.data);

export const getTeacherAttendanceReport = (params?: any) =>
  api.get('/attendance/teachers', { params }).then((r) => r.data);

export const markTeacherAttendance = (data: any) =>
  api.post('/attendance/teachers', data).then((r) => r.data);

export const getSchedule = (params?: any) =>
  api.get('/schedule', { params }).then((r) => r.data);
