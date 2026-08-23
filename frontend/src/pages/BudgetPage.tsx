import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import CategoryChip from '../components/CategoryChip';
import BackButton from '../components/BackButton';
import { budgetService, type Budget, type BudgetProgression } from '../services/budgetService';
import { categoryService, type Category } from '../services/categoryService';

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [progression, setProgression] = useState<BudgetProgression[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ categorie: string; montant: string } | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [error, setError] = useState('');
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgetData, progData, categoryData] = await Promise.all([
        budgetService.list(), budgetService.getProgression(), categoryService.getCategories('depense'),
      ]);
      setBudgets(budgetData.results);
      setProgression(progData);
      setCategories(categoryData);
    } catch {
      setError('Impossible de charger les budgets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    setError('');
    setAddingCategory(true);
    try {
      const existing = categories.find((category) => category.name.toLocaleLowerCase() === name.toLocaleLowerCase());
      const category = existing ?? await categoryService.createCategory({ name, type: 'depense' });
      if (!existing) setCategories((current) => [...current, category].sort((a, b) => a.name.localeCompare(b.name)));
      setEditing({ categorie: category.name, montant: '' });
      setNewCategory('');
    } catch {
      setError('Cette catégorie existe déjà ou ne peut pas être créée.');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSave = async (categorie: string) => {
    if (!editing) return;
    const montant = parseFloat(editing.montant);
    if (isNaN(montant) || montant <= 0) { setError('Le budget doit être supérieur à zéro.'); return; }
    const existing = budgets.find((budget) => budget.categorie === categorie && budget.mois === currentMonth);
    try {
      if (existing) await budgetService.update(existing.id, { categorie, montant, mois: currentMonth });
      else await budgetService.create({ categorie, montant, mois: currentMonth });
      setEditing(null);
      await fetchData();
    } catch { setError('Impossible d’enregistrer ce budget.'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce budget ?')) return;
    try { await budgetService.delete(id); await fetchData(); }
    catch { setError('Impossible de supprimer ce budget.'); }
  };

  const formatXOF = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value);
  const getProgressColor = (pct: number) => pct >= 100 ? 'var(--color-danger)' : pct >= 80 ? 'var(--color-warning)' : 'var(--color-success)';

  return (
    <div className="page-panel page-panel--wide">
      <BackButton to="/" label="← Accueil" />
      <div className="page-header-row"><div><h1>Budgets mensuels</h1><p style={{ color: 'var(--color-text-secondary)', marginTop: 6 }}>Crée un budget pour chacune de tes catégories.</p></div></div>

      <Card style={{ margin: '20px 0' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>Nouvelle catégorie de budget</h2>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && handleAddCategory()} placeholder="Ex. Assurance, animaux, épargne" style={{ flex: '1 1 250px', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)', color: 'var(--color-text)' }} />
          <Button onClick={handleAddCategory} loading={addingCategory}>+ Ajouter</Button>
        </div>
      </Card>

      {error && <p className="text-danger" style={{ marginBottom: 'var(--space-md)' }}>{error}</p>}
      {loading ? <p style={{ textAlign: 'center', padding: 40 }}>Chargement...</p> : categories.length === 0 ? <Card><p className="text-muted">Ajoute une première catégorie pour créer un budget.</p></Card> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {categories.map((category) => {
            const budget = budgets.find((item) => item.categorie === category.name && item.mois === currentMonth);
            const prog = progression.find((item) => item.categorie === category.name);
            const isEditing = editing?.categorie === category.name;
            return <Card key={category.id} padding="var(--space-md)">
              <div className="card-row" style={{ marginBottom: prog ? 'var(--space-sm)' : 0 }}>
                <CategoryChip category={category.name} />
                {isEditing ? <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="number" step="0.01" min="0.01" value={editing.montant} onChange={(event) => setEditing({ ...editing, montant: event.target.value })} placeholder="Montant FCFA" autoFocus style={{ width: 150, padding: '7px 9px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }} />
                  <Button size="sm" onClick={() => handleSave(category.name)}>Enregistrer</Button><Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
                </div> : <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong>{budget ? formatXOF(budget.montant) : 'Aucun budget'}</strong>
                  <Button size="sm" variant="ghost" onClick={() => setEditing({ categorie: category.name, montant: budget ? String(budget.montant) : '' })}>{budget ? 'Modifier' : 'Définir'}</Button>
                  {budget && <Button size="sm" variant="danger" onClick={() => handleDelete(budget.id)}>Supprimer</Button>}
                </div>}
              </div>
              {prog && <div><div style={{ height: 8, backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min(prog.pourcentage_atteint, 100)}%`, backgroundColor: getProgressColor(prog.pourcentage_atteint), transition: 'width .3s ease' }} /></div><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}><span>{formatXOF(prog.depense)} dépensé</span><span>{prog.pourcentage_atteint}%</span></div></div>}
            </Card>;
          })}
        </div>
      )}
    </div>
  );
}
