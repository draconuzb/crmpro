import api from '../../lib/axios';

// Lesson payments
export const runDailyDeduction = (date?: string) =>
  api.post('/lesson-payments/run-daily', { date }).then(r => r.data);

export const writeOffLessonPayment = (id: number, reason?: string) =>
  api.post(`/lesson-payments/${id}/write-off`, { reason }).then(r => r.data);

export const undoWriteOff = (id: number) =>
  api.post(`/lesson-payments/${id}/undo-write-off`).then(r => r.data);

export const getLessonPaymentsByGroup = (groupId: number, month?: string) =>
  api.get(`/lesson-payments/by-group/${groupId}`, { params: { month } }).then(r => r.data);

export const getLessonPaymentsByStudent = (studentId: number, month?: string) =>
  api.get(`/lesson-payments/by-student/${studentId}`, { params: { month } }).then(r => r.data);

export const getTeacherSalary = (teacherId: number, month: number, year: number) =>
  api.get(`/lesson-payments/teacher-salary/${teacherId}`, { params: { month, year } }).then(r => r.data);

// Teacher salary settings
export const updateTeacherSalary = (teacherId: number, data: { salaryType: string; salaryAmount: number }) =>
  api.patch(`/teachers/${teacherId}`, data).then(r => r.data);
