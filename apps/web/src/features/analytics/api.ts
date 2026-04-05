import api from '../../lib/axios';

export interface FilterParams {
  month?: string;
  quarter?: string;
  range?: string;
  year?: string;
}

// CEO Dashboard — full overview with finance, leads, attendance, problems, rooms
export const getDashboardOverview = (params?: FilterParams) =>
  api.get('/analytics/dashboard', { params }).then((r) => r.data);

// Single branch trends — monthly data with period comparison
export const getBranchTrends = (params?: FilterParams) =>
  api.get('/analytics/branch-trends', { params }).then((r) => r.data);

// All branches comparison — ranking with composite scores
export const getBranchComparison = (params?: FilterParams) =>
  api.get('/analytics/branch-compare', { params }).then((r) => r.data);

// Attendance trend (single or multi-branch)
export const getAttendanceTrend = (params?: FilterParams) =>
  api.get('/analytics/att-trend', { params }).then((r) => r.data);

// Financial intelligence — full breakdown
export const getFinancialIntelligence = (params?: FilterParams) =>
  api.get('/analytics/financial-intelligence', { params }).then((r) => r.data);

// Activity feed
export const getActivityFeed = (limit = 20) =>
  api.get('/analytics/activity-feed', { params: { limit } }).then((r) => r.data);

// Manager accountability
export const getManagerAccountability = (params?: FilterParams) =>
  api.get('/analytics/manager-accountability', { params }).then((r) => r.data);
