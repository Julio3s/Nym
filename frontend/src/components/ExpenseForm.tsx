import { useState, type FormEvent } from 'react';
import Input from './Input';
import Button from './Button';
import type { ExpenseFormData } from '../services/expenseService';

const CATEGORIES = [
  'alimentation', 'transport', 'logement', 'loisirs',
  'sante', 'education', 'shopping', 'autres',
];

const REVENU_CATEGORIES = ['salaire', 'freelance', 'investissement', 'vente', 'autres'];

interface ExpenseFormProps {
  initialData?: ExpenseFormData;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  loading?: boolean;
  mode?: 'depense' | 'revenu';
}

export default function ExpenseForm({ initialData, onSubmit, loading, mode = 'depense' }: ExpenseFormProps) {
  const [montant, setMontant] = useState(initialData?.montant?.toString() || '');
  const [categorie, setCategorie] = useState(initialData?.categorie || (mode === 'revenu' ? 'salaire' : 'alimentation'));
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const categories = mode === 'revenu' ? REVENU_CATEGORIES : CATEGORIES;

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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategorie(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: `2px solid ${categorie === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: categorie === cat ? 'var(--color-primary-light)' : 'transparent',
                color: categorie === cat ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: categorie === cat ? 600 : 400,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                textTransform: 'capitalize',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
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