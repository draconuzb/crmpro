import api from '../../lib/axios';

// Student
export const getMyStudentDashboard = async () => {
  const { data } = await api.get('/me/student/dashboard');
  return data;
};

export const getMyStudentGroups = async () => {
  const { data } = await api.get('/me/student/groups');
  return data;
};

export const getMyStudentSchedule = async () => {
  const { data } = await api.get('/me/student/schedule');
  return data;
};

export const getMyStudentGrades = async () => {
  const { data } = await api.get('/me/student/grades');
  return data;
};

export const getMyStudentAttendance = async () => {
  const { data } = await api.get('/me/student/attendance');
  return data;
};

export const getMyStudentPayments = async () => {
  const { data } = await api.get('/me/student/payments');
  return data;
};

// Teacher
export const getMyTeacherDashboard = async () => {
  const { data } = await api.get('/me/teacher/dashboard');
  return data;
};

export const getMyTeacherGroups = async () => {
  const { data } = await api.get('/me/teacher/groups');
  return data;
};

export const getMyTeacherGroupDetail = async (groupId: number) => {
  const { data } = await api.get(`/me/teacher/groups/${groupId}`);
  return data;
};

export const getMyTeacherSalary = async (month?: number, year?: number) => {
  const { data } = await api.get('/me/teacher/salary', { params: { month, year } });
  return data;
};
