import api from './api';

export interface Category {
  id: number;
  name: string;
  type: 'depense' | 'revenu';
  created_at: string;
}

export const categoryService = {
  async getCategories(type?: 'depense' | 'revenu'): Promise<Category[]> {
    const params = type ? { type } : {};
    const res = await api.get('/categories/', { params });
    return res.data;
  },

  async createCategory(data: { name: string; type: 'depense' | 'revenu' }): Promise<Category> {
    const res = await api.post('/categories/', data);
    return res.data;
  },

  async getCategoryTypes() {
    const res = await api.get('/categories/types/');
    return res.data;
  },
};