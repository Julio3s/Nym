import api from './api';

export interface Subscription { id: number; name: string; price: string; billing_day: number; started_at: string; cancelled_at: string | null; status: 'active' | 'cancelled'; description: string; charges: { id: number; billing_period: string; charged_at: string; }[]; }

export const subscriptionService = {
  async list(params?: Record<string, string | number>) { return (await api.get('/subscriptions/', { params })).data; },
  async create(data: { name: string; price: number; billing_day: number; started_at: string; description: string }) { return (await api.post('/subscriptions/', data)).data; },
  async cancel(id: number) { return (await api.post(`/subscriptions/${id}/cancel/`)).data; },
};
