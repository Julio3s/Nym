import api from './api';

export interface Debt {
  id: number;
  creditor: string;
  montant_initial: number;
  montant_restant: number;
  date_echeance: string | null;
  description: string;
  statut: 'ouverte' | 'payee';
  created_at: string;
  updated_at: string;
}

export interface DebtFormData {
  creditor: string;
  montant_initial: number;
  montant_restant: number;
  date_echeance: string | null;
  description: string;
}

export const debtService = {
  async list() {
    const res = await api.get('/debts/');
    return res.data as { results: Debt[] };
  },

  async create(data: DebtFormData) {
    const res = await api.post('/debts/', data);
    return res.data as Debt;
  },

  async pay(id: number) {
    const res = await api.post(`/debts/${id}/pay/`);
    return res.data as Debt;
  },

  async delete(id: number) {
    await api.delete(`/debts/${id}/`);
  },
};
