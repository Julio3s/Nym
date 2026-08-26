import api from './api';

export interface InvoiceType { id: number; name: string; }
export interface Invoice { id: number; invoice_type: number; type_name: string; title: string; amount: string; issue_date: string; due_date: string | null; status: 'paid' | 'unpaid'; paid_at: string | null; description: string; }
export interface InvoiceCreateData { invoice_type: number; title: string; amount: number; issue_date: string; due_date: string | null; description: string; }

export const invoiceService = {
  async list(params?: Record<string, string | number>) { return (await api.get('/invoices/', { params })).data; },
  async types() { return (await api.get('/invoice-types/')).data; },
  async createType(name: string) { return (await api.post('/invoice-types/', { name })).data; },
  async create(data: InvoiceCreateData) { return (await api.post('/invoices/', data)).data; },
  async pay(id: number) { return (await api.post(`/invoices/${id}/pay/`)).data; },
};
