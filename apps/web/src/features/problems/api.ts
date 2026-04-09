import api from '../../lib/axios';

export const getProblems = async (params?: { status?: string; type?: string; search?: string }) => {
  const { data } = await api.get('/problems', { params });
  return data;
};

export const createProblem = async (dto: { type: string; issue: string }) => {
  const { data } = await api.post('/problems', dto);
  return data;
};

export const updateProblem = async (id: number, dto: any) => {
  const { data } = await api.patch(`/problems/${id}`, dto);
  return data;
};

export const deleteProblem = async (id: number) => {
  const { data } = await api.delete(`/problems/${id}`);
  return data;
};

export const getProblemStats = async () => {
  const { data } = await api.get('/problems/stats');
  return data;
};
