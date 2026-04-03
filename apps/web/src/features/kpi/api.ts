import api from '../../lib/axios';

export const getKpiTargets = async (month?: string) => {
  const { data } = await api.get('/kpi/targets', { params: { month } });
  return data;
};

export const createKpiTarget = async (dto: { metric: string; month: string; targetValue: number }) => {
  const { data } = await api.post('/kpi/targets', dto);
  return data;
};

export const deleteKpiTarget = async (id: number) => {
  const { data } = await api.delete(`/kpi/targets/${id}`);
  return data;
};

export const getKpiAssignments = async (month?: string) => {
  const { data } = await api.get('/kpi/assignments', { params: { month } });
  return data;
};

export const createKpiAssignment = async (dto: any) => {
  const { data } = await api.post('/kpi/assignments', dto);
  return data;
};

export const deleteKpiAssignment = async (id: number) => {
  const { data } = await api.delete(`/kpi/assignments/${id}`);
  return data;
};

export const getKpiDashboard = async (month: string) => {
  const { data } = await api.get('/kpi/dashboard', { params: { month } });
  return data;
};
