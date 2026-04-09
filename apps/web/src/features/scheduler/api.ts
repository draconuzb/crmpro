import api from '../../lib/axios';

export const getCronJobs = async () => {
  const { data } = await api.get('/scheduler/jobs');
  return data;
};

export const createCronJob = async (dto: any) => {
  const { data } = await api.post('/scheduler/jobs', dto);
  return data;
};

export const updateCronJob = async (id: number, dto: any) => {
  const { data } = await api.patch(`/scheduler/jobs/${id}`, dto);
  return data;
};

export const toggleCronJob = async (id: number) => {
  const { data } = await api.patch(`/scheduler/jobs/${id}/toggle`);
  return data;
};

export const deleteCronJob = async (id: number) => {
  const { data } = await api.delete(`/scheduler/jobs/${id}`);
  return data;
};
