import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { invoiceService, type Invoice, type InvoiceType } from '../services/invoiceService';

const money = (value: string) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(Number(value));

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [types, setTypes] = useState<InvoiceType[]>([]);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [newType, setNewType] = useState('');
  const [form, setForm] = useState({ invoice_type: '', title: '', amount: '', issue_date: new Date().toISOString().slice(0, 10), due_date: '', description: '' });
  const [error, setError] = useState('');

  const load = () => Promise.all([invoiceService.list({ ...(status && { status }), ...(type && { invoice_type: type }) }), invoiceService.types()]).then(([data, typeData]) => { setInvoices(data.results || data); setTypes(typeData.results || typeData); }).catch(() => setError('Impossible de charger les factures.'));
  useEffect(() => { load(); }, [status, type]);
  const update = (key: string, value: string) => setForm({ ...form, [key]: value });
  const createType = async () => { if (!newType.trim()) return; await invoiceService.createType(newType.trim()); setNewType(''); load(); };
  const create = async (event: React.FormEvent) => { event.preventDefault(); setError(''); try { await invoiceService.create({ ...form, invoice_type: Number(form.invoice_type), amount: Number(form.amount), due_date: form.due_date || null }); setForm({ ...form, title: '', amount: '', due_date: '', description: '' }); load(); } catch { setError('Vérifie le type et le montant de la facture.'); } };
  const pay = async (id: number) => { try { await invoiceService.pay(id); load(); } catch { setError('Impossible de payer cette facture.'); } };

  return <div className="page-panel page-panel--wide"><BackButton to="/" label="← Accueil" /><div className="page-header-row"><div><h1>Factures</h1><p className="text-muted">Déclare tes factures, puis marque-les payées quand le règlement est effectué.</p></div><Link to="/subscriptions"><Button variant="secondary">Abonnements</Button></Link></div>
    {error && <p className="form-error">{error}</p>}
    <Card><h2>Déclarer une facture</h2><form className="billing-form" onSubmit={create}><label>Type de facture<select value={form.invoice_type} onChange={(e) => update('invoice_type', e.target.value)} required><option value="">Choisir un type</option>{types.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Nom de la facture<input value={form.title} onChange={(e) => update('title', e.target.value)} required /></label><label>Montant<input type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => update('amount', e.target.value)} required /></label><label>Date<input type="date" value={form.issue_date} onChange={(e) => update('issue_date', e.target.value)} required /></label><label>Échéance<input type="date" value={form.due_date} onChange={(e) => update('due_date', e.target.value)} /></label><label>Description<textarea value={form.description} onChange={(e) => update('description', e.target.value)} /></label><Button type="submit">Ajouter la facture</Button></form><div className="billing-type-create"><input placeholder="Nouveau type (ex. Électricité)" value={newType} onChange={(e) => setNewType(e.target.value)} /><Button variant="secondary" onClick={createType}>Créer le type</Button></div></Card>
    <Card><div className="billing-filters"><Button size="sm" variant={!status ? 'primary' : 'ghost'} onClick={() => setStatus('')}>Toutes</Button><Button size="sm" variant={status === 'unpaid' ? 'primary' : 'ghost'} onClick={() => setStatus('unpaid')}>Non payées</Button><Button size="sm" variant={status === 'paid' ? 'primary' : 'ghost'} onClick={() => setStatus('paid')}>Payées</Button><select value={type} onChange={(e) => setType(e.target.value)}><option value="">Tous les types</option>{types.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div className="stack-list">{invoices.map((invoice) => <div className="billing-item" key={invoice.id}><div><strong>{invoice.title}</strong><small>{invoice.type_name} · {invoice.issue_date}{invoice.due_date ? ` · échéance ${invoice.due_date}` : ''}</small><small>{invoice.description}</small></div><strong>{money(invoice.amount)}</strong><span className={invoice.status === 'paid' ? 'admin-status admin-status--active' : 'admin-status'}>{invoice.status === 'paid' ? 'Payée' : 'Non payée'}</span>{invoice.status === 'unpaid' && <Button size="sm" onClick={() => pay(invoice.id)}>Marquer payée</Button>}</div>)}{invoices.length === 0 && <p className="text-muted">Aucune facture pour ces filtres.</p>}</div></Card>
  </div>;
}
