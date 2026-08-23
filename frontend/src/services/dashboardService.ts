import api from './api';

export interface Summary {
  today: { depenses: number; revenus: number; count: number };
  month: { depenses: number; revenus: number; count: number };
  solde: number;
  totaux: { depenses: number; revenus: number };
  period: { date_debut: string; date_fin: string; depenses: number; revenus: number; solde: number };
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
  async getSummary(params?: { date_debut?: string; date_fin?: string }) {
    const res = await api.get('/dashboard/summary/', { params });
    return res.data as Summary;
  },

  async getByCategory(mois?: string, type?: 'depense' | 'revenu') {
    const params: Record<string, string> = {};
    if (mois) params.mois = mois;
    if (type) params.type = type;
    const res = await api.get('/dashboard/by-category/', { params });
    return res.data as { mois: string; type: string | null; categories: CategoryData[] };
  },

  async getTimeline(months: number = 6, type?: 'depense' | 'revenu') {
    const params: Record<string, string | number> = { months };
    if (type) params.type = type;
    const res = await api.get('/dashboard/timeline/', { params });
    return res.data as TimelineEntry[];
  },
};
