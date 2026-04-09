import api from '../../lib/axios';

export const getDiscounts = () =>
  api.get('/discounts').then((r) => r.data);

export const getGroupDiscounts = (groupId: number) =>
  api.get(`/discounts/group/${groupId}`).then((r) => r.data);

export const createDiscount = (groupId: number, data: { name: string; percentage?: number; fixedAmount?: number }) =>
  api.post(`/discounts/group/${groupId}`, data).then((r) => r.data);

export const updateDiscount = (id: number, data: { name?: string; percentage?: number; fixedAmount?: number; isActive?: boolean }) =>
  api.patch(`/discounts/${id}`, data).then((r) => r.data);

export const deleteDiscount = (id: number) =>
  api.delete(`/discounts/${id}`).then((r) => r.data);
