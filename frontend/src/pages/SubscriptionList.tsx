import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { subscriptionService, type Subscription } from '../services/subscriptionService';

const money = (value: string) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(Number(value));

export default function SubscriptionList() {
  const [items, setItems] = useState<Subscription[]>([]);
  const [form, setForm] = useState({ name: '', price: '', billing_day: '1', started_at: new Date().toISOString().slice(0, 10), description: '' });
  const [error, setError] = useState('');
  const load = () => subscriptionService.list().then((data) => setItems(data.results || data)).catch(() => setError('Impossible de charger les abonnements.'));
  useEffect(() => { load(); }, []);
  const update = (key: string, value: string) => setForm({ ...form, [key]: value });
  const create = async (event: React.FormEvent) => { event.preventDefault(); try { await subscriptionService.create({ ...form, price: Number(form.price), billing_day: Number(form.billing_day) }); setForm({ ...form, name: '', price: '', description: '' }); load(); } catch { setError('Le nom, le prix fixe et le jour sont obligatoires.'); } };
  const cancel = async (id: number) => { if (window.confirm('Résilier cet abonnement ? Les prélèvements futurs seront arrêtés.')) { await subscriptionService.cancel(id); load(); } };
  return <div className="page-panel page-panel--wide"><BackButton to="/" label="← Accueil" /><div className="page-header-row"><div><h1>Abonnements</h1><p className="text-muted">Un prix fixe est prélevé une fois par mois jusqu’à la résiliation.</p></div><Link to="/invoices"><Button variant="secondary">Factures</Button></Link></div>{error && <p className="form-error">{error}</p>}<Card><h2>Déclarer un abonnement</h2><form className="billing-form" onSubmit={create}><label>Nom<input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Netflix, loyer..." required /></label><label>Prix fixe mensuel<input type="number" min="0.01" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} required /></label><label>Jour du prélèvement (1 à 28)<input type="number" min="1" max="28" value={form.billing_day} onChange={(e) => update('billing_day', e.target.value)} required /></label><label>Commence le<input type="date" value={form.started_at} onChange={(e) => update('started_at', e.target.value)} required /></label><label>Description<textarea value={form.description} onChange={(e) => update('description', e.target.value)} /></label><Button type="submit">Ajouter l’abonnement</Button></form></Card><div className="stack-list">{items.map((item) => <Card key={item.id}><div className="billing-item"><div><strong>{item.name}</strong><small>{money(item.price)} par mois · le {item.billing_day} · depuis {item.started_at}</small><small>{item.charges.length} prélèvement(s) enregistré(s)</small></div><span className={item.status === 'active' ? 'admin-status admin-status--active' : 'admin-status'}>{item.status === 'active' ? 'Actif' : 'Résilié'}</span>{item.status === 'active' && <Button size="sm" variant="danger" onClick={() => cancel(item.id)}>Résilier</Button>}</div>{item.charges.length > 0 && <div className="billing-history">Historique : {item.charges.map((charge) => charge.billing_period).join(' · ')}</div>}</Card>)}{items.length === 0 && <Card><p className="text-muted">Aucun abonnement déclaré.</p></Card>}</div></div>;
}
