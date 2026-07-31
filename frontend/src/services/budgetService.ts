import api from './api';

export interface Budget {
  id: number;
  categorie: string;
  montant: number;
  mois: string;
}

export interface BudgetProgression {
  categorie: string;
  budget: number;
  depense: number;
  pourcentage_atteint: number;
  alerte: boolean;
}

export const budgetService = {
  async list() {
    const res = await api.get('/budgets/');
    return res.data as { results: Budget[] };
  },

  async create(data: { categorie: string; montant: number; mois: string }) {
    const res = await api.post('/budgets/', data);
    return res.data as Budget;
  },

  async update(id: number, data: { categorie: string; montant: number; mois: string }) {
    const res = await api.put(`/budgets/${id}/`, data);
    return res.data as Budget;
  },

  async delete(id: number) {
    await api.delete(`/budgets/${id}/`);
  },

  async getProgression() {
    const res = await api.get('/budgets/progression/');
    return res.data as BudgetProgression[];
  },
};