import api from '../../lib/axios';

export const getTeachers = (params?: any) => api.get('/teachers', { params }).then(r => r.data);
export const getTeacher = (id: number) => api.get(`/teachers/${id}`).then(r => r.data);
export const createTeacher = (data: any) => api.post('/teachers', data).then(r => r.data);
export const updateTeacher = (id: number, data: any) => api.patch(`/teachers/${id}`, data).then(r => r.data);
export const deleteTeacher = (id: number) => api.delete(`/teachers/${id}`).then(r => r.data);
export const getTeacherHistory = (id: number) => api.get(`/teachers/${id}/history`).then(r => r.data);
export const getTeacherSalary = (id: number, month: number, year: number) =>
  api.get(`/teachers/${id}/salary`, { params: { month, year } }).then(r => r.data);
