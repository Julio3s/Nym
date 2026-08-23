import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import CategoryChip from '../components/CategoryChip';
import BackButton from '../components/BackButton';
import { expenseService, type Expense } from '../services/expenseService';
import { dashboardService } from '../services/dashboardService';

const formatXOF = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value);

export default function RevenueList() {
  const [revenues, setRevenues] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalRevenus, setTotalRevenus] = useState(0);

  const fetchRevenues = async () => {
    setLoading(true);
    try {
      const [data, summary] = await Promise.all([
        expenseService.list({ type: 'revenu', page, ordering: '-date' }),
        dashboardService.getSummary(),
      ]);
      setRevenues(data.results);
      setTotal(data.count);
      setTotalRevenus(summary.totaux?.revenus ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenues();
  }, [page]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer ce revenu ?')) {
      await expenseService.delete(id);
      fetchRevenues();
    }
  };

  return (
    <div className="page-panel page-panel--wide">
      <BackButton to="/" label="← Accueil" />

      <div className="page-header-row">
        <div>
          <h1>Mes revenus</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Total : <strong style={{ color: 'var(--color-success)' }}>{formatXOF(totalRevenus)}</strong>
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/revenues/new">
            <Button>+ Ajouter un revenu</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: 40 }}>Chargement...</p>
      ) : revenues.length === 0 ? (
        <Card>
          <p style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
            Aucun revenu enregistré. <Link to="/revenues/new">Ajouter un revenu</Link>
          </p>
        </Card>
      ) : (
        <div className="stack-list">
          {revenues.map((rev) => (
            <Card key={rev.id} padding="var(--space-md)">
              <div className="card-row">
                <div className="expense-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)', flexWrap: 'wrap' }}>
                    <CategoryChip category={rev.categorie} />
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                      {new Date(rev.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {rev.description && (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                      {rev.description}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: 'var(--color-success)' }}>
                    +{formatXOF(parseFloat(String(rev.montant)))}
                  </p>
                  <div className="card-actions" style={{ marginTop: 'var(--space-xs)' }}>
                    <Link to={`/expenses/${rev.id}/edit`}>
                      <Button variant="ghost" size="sm">Modifier</Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(rev.id)}>
                      Suppr.
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {total > 20 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-lg)', flexWrap: 'wrap' }}>
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>Page {page}</span>
          <Button variant="secondary" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Suivant</Button>
        </div>
      )}
    </div>
  );
}
