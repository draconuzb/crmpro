import api from '../../lib/axios';

export const getLeads = (params?: any) =>
  api.get('/leads', { params }).then((r) => r.data);

export const getLead = (id: number) =>
  api.get(`/leads/${id}`).then((r) => r.data);

export const createLead = (data: any) =>
  api.post('/leads', data).then((r) => r.data);

export const updateLead = (id: number, data: any) =>
  api.patch(`/leads/${id}`, data).then((r) => r.data);

export const updateLeadStatus = (id: number, status: string) =>
  api.patch(`/leads/${id}/status`, { status }).then((r) => r.data);

export const convertLead = (id: number) =>
  api.post(`/leads/${id}/convert`).then((r) => r.data);

export const addLeadTag = (id: number, tagId: number) =>
  api.post(`/leads/${id}/tags`, { tagId }).then((r) => r.data);

export const removeLeadTag = (id: number, tagId: number) =>
  api.delete(`/leads/${id}/tags/${tagId}`).then((r) => r.data);

export const getCourses = () =>
  api.get('/courses').then((r) => r.data);

export const getTags = () =>
  api.get('/tags').then((r) => r.data);
