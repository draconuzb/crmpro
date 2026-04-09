import api from '../../lib/axios';

export const getConversionReport = (params?: any) =>
  api.get('/reports/conversion', { params }).then((r) => r.data);

export const getAttendanceReport = (params?: any) =>
  api.get('/attendance/report', { params }).then((r) => r.data);

export const getLeadsReport = (params?: any) =>
  api.get('/leads', { params }).then((r) => r.data);

export const getStudentsLeft = (params?: any) =>
  api.get('/reports/students-left', { params }).then((r) => r.data);

export const getLogs = (params?: any) =>
  api.get('/reports/logs', { params }).then((r) => r.data);
