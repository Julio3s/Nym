import { useState, useEffect, type FormEvent } from 'react';
import Input from './Input';
import Button from './Button';
import type { ExpenseFormData } from '../services/expenseService';
import { categoryService, type Category } from '../services/categoryService';

interface ExpenseFormProps {
  initialData?: ExpenseFormData;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  loading?: boolean;
  mode?: 'depense' | 'revenu';
}

export default function ExpenseForm({ initialData, onSubmit, loading, mode = 'depense' }: ExpenseFormProps) {
  const [montant, setMontant] = useState(initialData?.montant?.toString() || '');
  const [categorie, setCategorie] = useState(initialData?.categorie || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getCategories(mode);
        setCategories(data);
        if (!initialData?.categorie && data.length > 0) {
          setCategorie(data[0].name);
        }
      } catch {
        // fallback static categories handled below if needed
      }
    };
    loadCategories();
  }, [mode, initialData?.categorie]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const created = await categoryService.createCategory({ name: newCategory.trim(), type: mode });
      setCategories((prev) => [...prev, created]);
      setCategorie(created.name);
      setNewCategory('');
      setShowNewCategory(false);
    } catch {
      setError("Impossible d'ajouter la catégorie");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const montantNum = parseFloat(montant);
    if (isNaN(montantNum) || montantNum <= 0) {
      setError('Le montant doit être un nombre positif');
      return;
    }

    try {
      await onSubmit({ type: mode, montant: montantNum, categorie, description, date });
    } catch {
      setError("Erreur lors de l'enregistrement");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-md)' }}>
          {error}
        </p>
      )}

      <Input
        label={`Montant (FCFA) — ${mode === 'revenu' ? 'Revenu' : 'Dépense'}`}
        type="number"
        step="0.01"
        min="0.01"
        value={montant}
        onChange={(e) => setMontant(e.target.value)}
        required
      />

      <div style={{ marginBottom: 'var(--space-md)' }}>
        <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          Catégorie
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategorie(cat.name)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: `2px solid ${categorie === cat.name ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: categorie === cat.name ? 'var(--color-primary-light)' : 'transparent',
                color: categorie === cat.name ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: categorie === cat.name ? 600 : 400,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textTransform: 'capitalize',
              }}
            >
              {cat.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowNewCategory((v) => !v)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '2px dashed var(--color-border)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            + Nouvelle catégorie
          </button>
        </div>

        {showNewCategory && (
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nom de la catégorie"
            />
            <Button type="button" onClick={handleAddCategory}>Ajouter</Button>
          </div>
        )}
      </div>

      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optionnelle"
      />

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
        {initialData ? 'Modifier' : 'Ajouter'} {mode === 'revenu' ? 'le revenu' : 'la dépense'}
      </Button>
    </form>
  );
}