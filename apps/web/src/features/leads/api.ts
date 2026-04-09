import api from '../../lib/axios';

// ── Lead Stages ──
export const getLeadStages = () =>
  api.get('/lead-stages').then((r) => r.data);

export const createLeadStage = (data: { key: string; label: string; color?: string }) =>
  api.post('/lead-stages', data).then((r) => r.data);

export const updateLeadStage = (id: number, data: { label?: string; color?: string; sortOrder?: number }) =>
  api.patch(`/lead-stages/${id}`, data).then((r) => r.data);

export const deleteLeadStage = (id: number) =>
  api.delete(`/lead-stages/${id}`).then((r) => r.data);

export const reorderLeadStages = (stageIds: number[]) =>
  api.post('/lead-stages/reorder', { stageIds }).then((r) => r.data);

// ── Lead Analytics ──
export const getLeadAnalytics = () =>
  api.get('/leads/analytics').then((r) => r.data);

// ── Leads ──
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

export const convertLead = (id: number, groupId?: number) =>
  api.post(`/leads/${id}/convert`, { groupId }).then((r) => r.data);

export const addLeadTag = (id: number, tagId: number) =>
  api.post(`/leads/${id}/tags`, { tagId }).then((r) => r.data);

export const removeLeadTag = (id: number, tagId: number) =>
  api.delete(`/leads/${id}/tags/${tagId}`).then((r) => r.data);

export const getCourses = () =>
  api.get('/courses').then((r) => r.data);

export const getTags = () =>
  api.get('/tags').then((r) => r.data);
