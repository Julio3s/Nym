import { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import BackButton from '../components/BackButton';
import { revenueService, type RevenueSource } from '../services/revenueService';

export default function RevenueSources() {
  const [sources, setSources] = useState<RevenueSource[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const data = await revenueService.getRevenueSources();
      setSources(data);
    } catch {
      setError('Impossible de charger les sources de revenus');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }
    setLoading(true);
    try {
      await revenueService.createRevenueSource({
        name: name.trim(),
        default_amount: amount ? parseFloat(amount) : null,
        description: description.trim() || undefined,
      });
      setName('');
      setAmount('');
      setDescription('');
      await load();
    } catch {
      setError("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (source: RevenueSource) => {
    try {
      await revenueService.updateRevenueSource(source.id, { is_active: !source.is_active });
      await load();
    } catch {
      setError("Impossible de mettre à jour");
    }
  };

  return (
    <div className="page-panel page-panel--narrow">
      <BackButton to="/expenses" label="← Liste des transactions" />
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>Sources de revenus</h1>

      <Card style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 style={{ marginBottom: 'var(--space-md)' }}>Ajouter une source</h2>
        {error && <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-md)' }}>{error}</p>}
        <form onSubmit={handleCreate}>
          <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Formation DevOps" required />
          <Input label="Montant par défaut (FCFA)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Optionnel" />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optionnelle" />
          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
            Ajouter la source
          </Button>
        </form>
      </Card>

      <Card>
        <h2 style={{ marginBottom: 'var(--space-md)' }}>Vos sources</h2>
        {sources.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>Aucune source enregistrée.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {sources.map((s) => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                  {s.default_amount ? `${s.default_amount.toLocaleString()} FCFA` : 'Montant non défini'}
                  {s.description && <span> — {s.description}</span>}
                </div>
              </div>
              <Button size="sm" variant={s.is_active ? 'secondary' : 'primary'} onClick={() => handleToggle(s)}>
                {s.is_active ? 'Désactiver' : 'Activer'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}