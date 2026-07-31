import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/Card';
import ExpenseForm from '../components/ExpenseForm';
import BackButton from '../components/BackButton';
import { expenseService, type ExpenseFormData } from '../services/expenseService';

export default function ExpenseEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<ExpenseFormData | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      expenseService.get(parseInt(id)).then((data) => {
        setInitialData({ ...data, montant: parseFloat(data.montant) });
        setLoading(false);
      }).catch(() => {
        navigate('/expenses');
      });
    }
  }, [id, navigate]);

  const handleSubmit = async (data: ExpenseFormData) => {
    if (id) {
      await expenseService.update(parseInt(id), data);
      navigate('/expenses');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}>Chargement...</div>;

  return (
    <div className="page-panel page-panel--narrow">
      <BackButton to="/expenses" label="← Liste des dépenses" />
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>Modifier la dépense</h1>
      <Card>
        <ExpenseForm initialData={initialData} onSubmit={handleSubmit} />
      </Card>
    </div>
  );
}
