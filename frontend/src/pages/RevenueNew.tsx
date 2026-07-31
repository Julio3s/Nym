import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import ExpenseForm from '../components/ExpenseForm';
import BackButton from '../components/BackButton';
import { expenseService, type ExpenseFormData } from '../services/expenseService';

export default function RevenueNew() {
  const navigate = useNavigate();

  const handleSubmit = async (data: ExpenseFormData) => {
    await expenseService.create(data);
    navigate('/expenses?type=revenu');
  };

  return (
    <div className="page-panel page-panel--narrow">
      <BackButton to="/expenses" label="← Liste des transactions" />
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>Nouveau revenu</h1>
      <Card>
        <ExpenseForm onSubmit={handleSubmit} mode="revenu" />
      </Card>
    </div>
  );
}
