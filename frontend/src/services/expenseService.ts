import api from './api';

export interface Expense {
  id: number;
  type: 'depense' | 'revenu';
  montant: string;
  category: number | null;
  categorie: string;
  category_name?: string | null;
  revenue_source?: number | null;
  revenue_source_name?: string | null;
  description: string;
  date: string;
  created_at: string;
}

export interface ExpenseFormData {
  type?: 'depense' | 'revenu';
  montant: number;
  categorie: string;
  revenue_source?: number | null;
  description: string;
  date: string;
}

export interface ExpenseListParams {
  type?: 'depense' | 'revenu';
  categorie?: string;
  date_debut?: string;
  date_fin?: string;
  search?: string;
  page?: number;
  ordering?: string;
}

export const expenseService = {
  async list(params?: ExpenseListParams) {
    const res = await api.get('/expenses/', { params });
    return res.data;
  },

  async get(id: number) {
    const res = await api.get(`/expenses/${id}/`);
    return res.data;
  },

  async create(data: ExpenseFormData) {
    const res = await api.post('/expenses/', data);
    return res.data;
  },

  async update(id: number, data: ExpenseFormData) {
    const res = await api.put(`/expenses/${id}/`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`/expenses/${id}/`);
  },
};