import api from '../../lib/axios';

export const getStudents = (params?: any) =>
  api.get('/students', { params }).then((r) => r.data);

export const getStudent = (id: number) =>
  api.get(`/students/${id}`).then((r) => r.data);

export const createStudent = (data: any) =>
  api.post('/students', data).then((r) => r.data);

export const updateStudent = (id: number, data: any) =>
  api.patch(`/students/${id}`, data).then((r) => r.data);

export const getStudentGroups = (id: number) =>
  api.get(`/students/${id}/groups`).then((r) => r.data);

export const getStudentComments = (id: number) =>
  api.get(`/students/${id}/comments`).then((r) => r.data);

export const addStudentComment = (id: number, text: string) =>
  api.post(`/students/${id}/comments`, { text }).then((r) => r.data);

export const addStudentPayment = (id: number, data: any) =>
  api.post(`/students/${id}/payments`, data).then((r) => r.data);

export const getStudentHistory = (id: number) =>
  api.get(`/students/${id}/history`).then((r) => r.data);

export const getStudentCallHistory = (id: number) =>
  api.get(`/students/${id}/calls`).then((r) => r.data);

export const getStudentSmsHistory = (id: number) =>
  api.get(`/students/${id}/sms`).then((r) => r.data);

export const getStudentLeadHistory = (id: number) =>
  api.get(`/students/${id}/lead-history`).then((r) => r.data);

export const getCourses = () =>
  api.get('/courses').then((r) => r.data);

export const getGroups = (params?: any) =>
  api.get('/groups', { params }).then((r) => r.data);
