import api from './api';

export interface Summary {
  today: { depenses: number; revenus: number; count: number };
  month: { depenses: number; revenus: number; count: number };
  solde: number;
}

export interface CategoryData {
  categorie: string;
  total: number;
  count: number;
}

export interface TimelineEntry {
  mois: string;
  total: number;
  count: number;
}

export const dashboardService = {
  async getSummary() {
    const res = await api.get('/dashboard/summary/');
    return res.data as Summary;
  },

  async getByCategory(mois?: string) {
    const params = mois ? { mois } : {};
    const res = await api.get('/dashboard/by-category/', { params });
    return res.data as { mois: string; categories: CategoryData[] };
  },

  async getTimeline(months: number = 6) {
    const res = await api.get('/dashboard/timeline/', { params: { months } });
    return res.data as TimelineEntry[];
  },
};