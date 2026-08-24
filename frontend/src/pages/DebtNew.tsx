import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import BackButton from '../components/BackButton';
import DebtForm from '../components/DebtForm';
import { debtService, type DebtFormData } from '../services/debtService';

export default function DebtNew() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: DebtFormData) => {
    setLoading(true);
    try {
      await debtService.create(data);
      navigate('/debts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-panel page-panel--narrow">
      <BackButton to="/debts" label="← Mes dettes" />
      <h1>Déclarer une dette</h1>
      <Card>
        <DebtForm onSubmit={handleSubmit} loading={loading} />
      </Card>
    </div>
  );
}
