import api from '../../lib/axios';

export const getHrStaff = async (params?: { status?: string; category?: string; search?: string }) => {
  const { data } = await api.get('/hr/staff', { params });
  return data;
};

export const createHrStaff = async (dto: any) => {
  const { data } = await api.post('/hr/staff', dto);
  return data;
};

export const updateHrStaff = async (id: number, dto: any) => {
  const { data } = await api.patch(`/hr/staff/${id}`, dto);
  return data;
};

export const deleteHrStaff = async (id: number) => {
  const { data } = await api.delete(`/hr/staff/${id}`);
  return data;
};

export const getHrStaffStats = async () => {
  const { data } = await api.get('/hr/staff/stats');
  return data;
};

export const getHrGoals = async (params?: { status?: string; category?: string }) => {
  const { data } = await api.get('/hr/goals', { params });
  return data;
};

export const createHrGoal = async (dto: any) => {
  const { data } = await api.post('/hr/goals', dto);
  return data;
};

export const updateHrGoal = async (id: number, dto: any) => {
  const { data } = await api.patch(`/hr/goals/${id}`, dto);
  return data;
};

export const deleteHrGoal = async (id: number) => {
  const { data } = await api.delete(`/hr/goals/${id}`);
  return data;
};
