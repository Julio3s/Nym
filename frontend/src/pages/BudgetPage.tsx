import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import CategoryChip from '../components/CategoryChip';
import BackButton from '../components/BackButton';
import { budgetService, type Budget, type BudgetProgression } from '../services/budgetService';

const CATEGORIES = [
  'alimentation', 'transport', 'logement', 'loisirs',
  'sante', 'education', 'shopping', 'autres',
];

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [progression, setProgression] = useState<BudgetProgression[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ categorie: string; montant: string } | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgetData, progData] = await Promise.all([
        budgetService.list(),
        budgetService.getProgression(),
      ]);
      setBudgets(budgetData.results);
      setProgression(progData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (categorie: string) => {
    if (!editing) return;
    const montant = parseFloat(editing.montant);
    if (isNaN(montant) || montant <= 0) return;

    const existing = budgets.find(b => b.categorie === categorie);
    try {
      if (existing) {
        await budgetService.update(existing.id, { categorie, montant, mois: currentMonth });
      } else {
        await budgetService.create({ categorie, montant, mois: currentMonth });
      }
      setEditing(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer ce budget ?')) {
      await budgetService.delete(id);
      fetchData();
    }
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 100) return 'var(--color-danger)';
    if (pct >= 80) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const formatXOF = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value);

  return (
    <div className="page-panel page-panel--wide">
      <BackButton to="/" label="← Dashboard" />
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>Budgets mensuels</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Définissez un budget par catégorie pour suivre vos dépenses.
      </p>

      {loading ? (
        <p style={{ textAlign: 'center', padding: 40 }}>Chargement...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {CATEGORIES.map((categorie) => {
            const budget = budgets.find(b => b.categorie === categorie);
            const prog = progression.find(p => p.categorie === categorie);
            const isEditing = editing?.categorie === categorie;

            return (
              <Card key={categorie} padding="var(--space-md)">
                <div className="card-row" style={{ marginBottom: 'var(--space-sm)' }}>
                  <CategoryChip category={categorie} />
                  
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={editing!.montant}
                        onChange={(e) => setEditing({ ...editing!, montant: e.target.value })}
                        style={{
                          width: 120,
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          fontSize: 'var(--font-size-sm)',
                        }}
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleSave(categorie)}>OK</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600 }}>
                        {budget ? formatXOF(budget.montant) : '—'}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing({ categorie, montant: budget ? budget.montant.toString() : '' })}
                      >
                        {budget ? 'Modifier' : 'Définir'}
                      </Button>
                      {budget && (
                        <Button size="sm" variant="danger" onClick={() => handleDelete(budget.id)}>
                          ×
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Barre de progression */}
                {prog && (
                  <div>
                    <div style={{
                      height: 8,
                      backgroundColor: 'var(--color-bg-tertiary)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                      marginTop: 'var(--space-sm)',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(prog.pourcentage_atteint, 100)}%`,
                        backgroundColor: getProgressColor(prog.pourcentage_atteint),
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xs)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      <span>{formatXOF(prog.depense)} dépensé</span>
                      <span style={{ color: prog.alerte ? 'var(--color-danger)' : 'inherit', fontWeight: prog.alerte ? 600 : 400 }}>
                        {prog.pourcentage_atteint}%
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
