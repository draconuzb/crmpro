import api from '../../lib/axios';

export const aiAnalyze = async (dto: { reportType: string; startDate: string; endDate: string }) => {
  const { data } = await api.post('/ai/analyze', dto);
  return data;
};

export const aiDetectAnomalies = async (dto: { startDate: string; endDate: string }) => {
  const { data } = await api.post('/ai/anomalies', dto);
  return data;
};

export const aiAsk = async (question: string) => {
  const { data } = await api.post('/ai/ask', { question });
  return data;
};

export const getAiHistory = async (limit = 20) => {
  const { data } = await api.get('/ai/history', { params: { limit } });
  return data;
};
