import api from '../../lib/axios';

export const getGroups = (params?: any) => api.get('/groups', { params }).then(r => r.data);
export const getGroup = (id: number) => api.get(`/groups/${id}`).then(r => r.data);
export const createGroup = (data: any) => api.post('/groups', data).then(r => r.data);
export const updateGroup = (id: number, data: any) => api.patch(`/groups/${id}`, data).then(r => r.data);
export const addStudentToGroup = (groupId: number, data: any) => api.post(`/groups/${groupId}/students`, data).then(r => r.data);
export const removeStudentFromGroup = (groupId: number, studentId: number) => api.delete(`/groups/${groupId}/students/${studentId}`).then(r => r.data);
export const getGroupAttendance = (groupId: number, month: number, year: number) =>
  api.get(`/groups/${groupId}/attendance`, { params: { month, year } }).then(r => r.data);
export const getGroupStudents = (groupId: number) => api.get(`/groups/${groupId}/students`).then(r => r.data);
