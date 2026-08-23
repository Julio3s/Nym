import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import CategoryChip from '../components/CategoryChip';
import { expenseService, type Expense } from '../services/expenseService';

export default function ExpenseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      expenseService.get(parseInt(id))
        .then(setExpense)
        .catch(() => navigate('/expenses'))
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm('Supprimer cette dépense ?')) {
      await expenseService.delete(parseInt(id!));
      navigate('/expenses');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}>Chargement...</div>;
  if (!expense) return null;

  const formatMontant = (m: string | number) => {
    const num = typeof m === 'string' ? parseFloat(m) : m;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(num);
  };

  return (
    <div className="page-panel page-panel--narrow">
      <Link to="/expenses" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)', display: 'inline-block' }}>
        ← Retour à la liste
      </Link>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>Détail de la dépense</h1>

      <Card>
        <div className="card-row card-row--top" style={{ marginBottom: 'var(--space-lg)' }}>
          <div>
            <CategoryChip category={expense.category_name || expense.categorie} />
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>
              {new Date(expense.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
            {formatMontant(expense.montant)}
          </p>
        </div>

        {expense.description && (
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xs)' }}>Description</h3>
            <p>{expense.description}</p>
          </div>
        )}

        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          Créé le {new Date(expense.created_at).toLocaleString('fr-FR')}
        </p>

        <div className="card-actions" style={{ marginTop: 'var(--space-lg)' }}>
          <Link to={`/expenses/${expense.id}/edit`} style={{ flex: 1 }}>
            <Button variant="secondary" style={{ width: '100%' }}>Modifier</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} style={{ flex: 1 }}>Supprimer</Button>
        </div>
      </Card>
    </div>
  );
}
