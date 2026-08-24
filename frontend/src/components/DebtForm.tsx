import { useState, type FormEvent } from 'react';
import Input from './Input';
import Button from './Button';
import type { DebtFormData } from '../services/debtService';

interface DebtFormProps {
  onSubmit: (data: DebtFormData) => Promise<void>;
  loading?: boolean;
}

export default function DebtForm({ onSubmit, loading = false }: DebtFormProps) {
  const [creditor, setCreditor] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const initial = Number(initialAmount);
    const remaining = Number(remainingAmount || initialAmount);

    if (!creditor.trim()) {
      setError('Le nom du créancier est requis.');
      return;
    }
    if (!Number.isFinite(initial) || initial <= 0) {
      setError('Le montant initial doit être supérieur à zéro.');
      return;
    }
    if (!Number.isFinite(remaining) || remaining < 0 || remaining > initial) {
      setError('Le montant restant doit être compris entre zéro et le montant initial.');
      return;
    }

    try {
      await onSubmit({
        creditor: creditor.trim(),
        montant_initial: initial,
        montant_restant: remaining,
        date_echeance: dueDate || null,
        description: description.trim(),
      });
    } catch (err: any) {
      const detail = err?.response?.data;
      setError(detail?.detail || detail?.montant_restant?.[0] || 'Impossible d’enregistrer cette dette.');
    }
  };

  return (
    <form className="debt-form" onSubmit={handleSubmit}>
      {error && <p className="form-error" role="alert">{error}</p>}
      <Input label="À qui dois-tu cet argent ?" value={creditor} onChange={(event) => setCreditor(event.target.value)} placeholder="Ex : Karim, banque, fournisseur" required />
      <div className="responsive-grid-2">
        <Input label="Montant initial (FCFA)" type="number" min="0.01" step="0.01" value={initialAmount} onChange={(event) => setInitialAmount(event.target.value)} required />
        <Input label="Montant restant (FCFA)" type="number" min="0" step="0.01" value={remainingAmount} onChange={(event) => setRemainingAmount(event.target.value)} placeholder="Même montant par défaut" />
      </div>
      <Input label="Date d’échéance" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
      <Input label="Note" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Pourquoi cette dette ?" />
      <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 'var(--space-md)' }}>
        Ajouter à mes dettes
      </Button>
    </form>
  );
}
