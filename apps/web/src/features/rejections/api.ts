import api from '@/lib/axios';

// Rejection Reasons
export const getRejectionReasons = () => api.get('/rejections/reasons').then(r => r.data);
export const createRejectionReason = (data: { label: string }) => api.post('/rejections/reasons', data).then(r => r.data);
export const updateRejectionReason = (id: number, label: string) => api.patch(`/rejections/reasons/${id}`, { label }).then(r => r.data);
export const deleteRejectionReason = (id: number) => api.delete(`/rejections/reasons/${id}`).then(r => r.data);

// Student Departures (Rad etganlar)
export const getDepartures = (params?: Record<string, any>) => api.get('/rejections/departures', { params }).then(r => r.data);
export const createDeparture = (data: { studentId: number; reasonId: number; note?: string; groupId?: number }) =>
  api.post('/rejections/departures', data).then(r => r.data);

// Lead Deletions
export const deleteLeadWithReason = (data: { leadId: number; reasonId: number; note?: string }) =>
  api.post('/rejections/lead-delete', data).then(r => r.data);
export const getLeadDeletions = (params?: Record<string, any>) => api.get('/rejections/lead-deletions', { params }).then(r => r.data);
