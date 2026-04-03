import api from '../../lib/axios';

export const getProducts = () => api.get('/gamification/products').then(r => r.data);
export const createProduct = (data: any) => api.post('/gamification/products', data).then(r => r.data);
export const updateProduct = (id: number, data: any) => api.patch(`/gamification/products/${id}`, data).then(r => r.data);
export const deleteProduct = (id: number) => api.delete(`/gamification/products/${id}`).then(r => r.data);
export const getOrders = (params?: any) => api.get('/gamification/orders', { params }).then(r => r.data);
export const createOrder = (data: any) => api.post('/gamification/orders', data).then(r => r.data);
export const updateOrderStatus = (id: number, status: string) => api.patch(`/gamification/orders/${id}/status`, { status }).then(r => r.data);
