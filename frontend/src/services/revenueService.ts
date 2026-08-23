import api from './api';

export interface RevenueSource {
  id: number;
  name: string;
  default_amount: number | null;
  description: string;
  is_active: boolean;
  created_at: string;
}

export const revenueService = {
  async getRevenueSources(): Promise<RevenueSource[]> {
    const res = await api.get('/revenue-sources/');
    return res.data.results ?? res.data;
  },

  async createRevenueSource(data: { name: string; default_amount?: number | null; description?: string }): Promise<RevenueSource> {
    const res = await api.post('/revenue-sources/', data);
    return res.data;
  },

  async updateRevenueSource(id: number, data: Partial<RevenueSource>): Promise<RevenueSource> {
    const res = await api.patch(`/revenue-sources/${id}/`, data);
    return res.data;
  },
};
