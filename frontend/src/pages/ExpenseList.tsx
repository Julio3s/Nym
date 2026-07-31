import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import CategoryChip from '../components/CategoryChip';
import BackButton from '../components/BackButton';
import { expenseService, type Expense } from '../services/expenseService';

const CATEGORIES = [
  'alimentation', 'transport', 'logement', 'loisirs',
  'sante', 'education', 'shopping', 'autres',
];

export default function ExpenseList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const typeFilter = searchParams.get('type') || '';
  const categorieFilter = searchParams.get('categorie') || '';
  const searchQuery = searchParams.get('search') || '';

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (typeFilter) params.type = typeFilter;
      if (categorieFilter) params.categorie = categorieFilter;
      if (searchQuery) params.search = searchQuery;
      const data = await expenseService.list(params);
      setExpenses(data.results);
      setTotal(data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page, typeFilter, categorieFilter, searchQuery]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer cette transaction ?')) {
      await expenseService.delete(id);
      fetchExpenses();
    }
  };

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const formatMontant = (m: string | number) => {
    const num = typeof m === 'string' ? parseFloat(m) : m;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(num);
  };

  return (
    <div className="page-panel page-panel--wide">
      <BackButton to="/" label="← Accueil" />

      <div className="page-header-row">
        <div>
          <h1>Mes transactions</h1>
        </div>
        <div className="page-header-actions">
          <Link to="/expenses/new">
            <Button>+ Dépense</Button>
          </Link>
          <Link to="/revenues/new">
            <Button variant="secondary">+ Revenu</Button>
          </Link>
        </div>
      </div>

      <Card style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setFilter('search', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-base)',
            }}
          />
        </div>

        <div className="filter-row" style={{ marginBottom: 'var(--space-md)' }}>
          <Button size="sm" variant={!typeFilter ? 'primary' : 'ghost'} onClick={() => setFilter('type', '')}>Tout</Button>
          <Button size="sm" variant={typeFilter === 'depense' ? 'primary' : 'ghost'} onClick={() => setFilter('type', 'depense')}>Dépenses</Button>
          <Button size="sm" variant={typeFilter === 'revenu' ? 'primary' : 'ghost'} onClick={() => setFilter('type', 'revenu')}>Revenus</Button>
        </div>

        <div className="filter-row filter-row--chips">
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              category={cat}
              selected={categorieFilter === cat}
              onClick={() => setFilter('categorie', categorieFilter === cat ? '' : cat)}
            />
          ))}
          {categorieFilter && (
            <button
              onClick={() => setFilter('categorie', '')}
              style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}
            >
              Effacer filtre
            </button>
          )}
        </div>
      </Card>

      {loading ? (
        <p style={{ textAlign: 'center', padding: 40 }}>Chargement...</p>
      ) : expenses.length === 0 ? (
        <Card><p style={{ textAlign: 'center', padding: 20 }}>Aucune transaction trouvée</p></Card>
      ) : (
        <div className="stack-list">
          {expenses.map((expense) => (
            <Card key={expense.id} padding="var(--space-md)">
              <div className="card-row">
                <div className="expense-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: expense.type === 'revenu' ? '#dcfce7' : '#fee2e2',
                      color: expense.type === 'revenu' ? '#16a34a' : '#dc2626',
                      textTransform: 'uppercase',
                    }}>
                      {expense.type === 'revenu' ? 'R' : 'D'}
                    </span>
                    <CategoryChip category={expense.categorie} />
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                      {new Date(expense.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {expense.description && (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                      {expense.description}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontWeight: 700,
                    fontSize: 'var(--font-size-lg)',
                    color: expense.type === 'revenu' ? 'var(--color-success)' : 'var(--color-text)',
                  }}>
                    {expense.type === 'revenu' ? '+' : '-'}{formatMontant(expense.montant)}
                  </p>
                  <div className="card-actions" style={{ marginTop: 'var(--space-xs)' }}>
                    <Link to={`/expenses/${expense.id}`}>
                      <Button variant="ghost" size="sm">Détail</Button>
                    </Link>
                    <Link to={`/expenses/${expense.id}/edit`}>
                      <Button variant="ghost" size="sm">Modifier</Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(expense.id)}>
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
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            Précédent
          </Button>
          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
            Page {page}
          </span>
          <Button variant="secondary" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
