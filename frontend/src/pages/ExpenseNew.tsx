import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import ExpenseForm from '../components/ExpenseForm';
import BackButton from '../components/BackButton';
import { expenseService, type ExpenseFormData } from '../services/expenseService';

export default function ExpenseNew() {
  const navigate = useNavigate();

  const handleSubmit = async (data: ExpenseFormData) => {
    await expenseService.create(data);
    navigate('/expenses');
  };

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: 20 }}>
      <BackButton to="/expenses" label="← Liste des dépenses" />
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>Nouvelle dépense</h1>
      <Card>
        <ExpenseForm onSubmit={handleSubmit} />
      </Card>
    </div>
  );
}