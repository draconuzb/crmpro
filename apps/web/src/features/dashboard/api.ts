import api from '../../lib/axios';

export const getDashboardStats = () =>
  api.get('/reports/dashboard/stats').then((r) => r.data);

export const getDashboardRevenue = () =>
  api.get('/reports/dashboard/revenue').then((r) => r.data);

export const getSchedule = (params?: any) =>
  api.get('/schedule', { params }).then((r) => r.data);
