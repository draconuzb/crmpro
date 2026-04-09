import api from '../../lib/axios';

export const getUpcomingLessons = () =>
  api.get('/online-lessons/upcoming').then((r) => r.data);

export const getGroupLessons = (groupId: number) =>
  api.get(`/online-lessons/group/${groupId}`).then((r) => r.data);

export const createOnlineLesson = (groupId: number, data: { title: string; url: string; date: string }) =>
  api.post(`/online-lessons/group/${groupId}`, data).then((r) => r.data);

export const updateOnlineLesson = (id: number, data: { title?: string; url?: string; date?: string }) =>
  api.patch(`/online-lessons/${id}`, data).then((r) => r.data);

export const deleteOnlineLesson = (id: number) =>
  api.delete(`/online-lessons/${id}`).then((r) => r.data);
