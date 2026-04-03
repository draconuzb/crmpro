import api from '../../lib/axios';

export const getReminders = () =>
  api.get('/reminders').then((r) => r.data);

export const createReminder = (data: any) =>
  api.post('/reminders', data).then((r) => r.data);

export const completeReminder = (id: number, note?: string) =>
  api.patch(`/reminders/${id}/complete`, { note }).then((r) => r.data);

export const deleteReminder = (id: number) =>
  api.delete(`/reminders/${id}`).then((r) => r.data);
