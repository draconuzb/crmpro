import api from '../../lib/axios';

export const getRatings = (params?: any) =>
  api.get('/ratings', { params }).then((r) => r.data);

export const getRatingChart = (params?: any) =>
  api.get('/ratings/chart', { params }).then((r) => r.data);
