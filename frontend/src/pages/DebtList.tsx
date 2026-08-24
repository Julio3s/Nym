import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import BackButton from '../components/BackButton';
import { debtService, type Debt } from '../services/debtService';

const formatXOF = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value);
const formatDate = (value: string | null) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR') : 'Sans échéance';

export default function DebtList() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  const loadDebts = async () => {
    try {
      setError('');
      const data = await debtService.list();
      setDebts(data.results);
    } catch {
      setError('Impossible de charger tes dettes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDebts(); }, []);

  const markAsPaid = async (debt: Debt) => {
    setActionId(debt.id);
    try {
      await debtService.pay(debt.id);
      await loadDebts();
    } catch {
      setError('Impossible de mettre à jour cette dette.');
    } finally {
      setActionId(null);
    }
  };

  const removeDebt = async (debt: Debt) => {
    if (!window.confirm(`Supprimer la dette envers ${debt.creditor} ?`)) return;
    setActionId(debt.id);
    try {
      await debtService.delete(debt.id);
      setDebts((current) => current.filter((item) => item.id !== debt.id));
    } catch {
      setError('Impossible de supprimer cette dette.');
    } finally {
      setActionId(null);
    }
  };

  const openDebts = debts.filter((debt) => debt.statut === 'ouverte');
  const paidDebts = debts.filter((debt) => debt.statut === 'payee');
  const totalRemaining = openDebts.reduce((total, debt) => total + Number(debt.montant_restant), 0);

  return (
    <div className="page-panel page-panel--wide debt-page">
      <BackButton to="/" label="← Accueil" />
      <div className="debt-page__header">
        <div>
          <p className="home-kicker">À ne pas oublier</p>
          <h1>Mes dettes</h1>
          <p className="text-muted">Garde une trace de ce que tu dois et avance sereinement.</p>
        </div>
        <Link className="debt-add-button" to="/debts/new">+ Déclarer une dette</Link>
      </div>

      <section className="debt-overview" aria-label="Résumé des dettes">
        <div><span>Reste à payer</span><strong>{loading ? '…' : formatXOF(totalRemaining)}</strong></div>
        <div><span>Dettes ouvertes</span><strong>{loading ? '…' : openDebts.length}</strong></div>
        <div><span>Déjà réglées</span><strong>{loading ? '…' : paidDebts.length}</strong></div>
      </section>

      {error && <p className="form-error" role="alert">{error}</p>}
      {loading ? <p className="text-muted debt-empty">Chargement de tes dettes…</p> : debts.length === 0 ? (
        <Card className="debt-empty-card">
          <div className="debt-empty-card__icon">✓</div>
          <h2>Tout est en ordre</h2>
          <p className="text-muted">Ajoute une dette pour garder une trace de tes remboursements.</p>
          <Link className="debt-add-button" to="/debts/new">Ajouter ma première dette</Link>
        </Card>
      ) : (
        <div className="debt-list">
          {debts.map((debt) => (
            <Card key={debt.id} style={{ opacity: debt.statut === 'payee' ? 0.72 : 1 }}>
              <div className="debt-item">
                <div className="debt-item__main">
                  <div className={`debt-item__icon debt-item__icon--${debt.statut}`}>{debt.statut === 'payee' ? '✓' : '!'}</div>
                  <div>
                    <h2>{debt.creditor}</h2>
                    <p className="text-muted">{debt.description || 'Aucune note'} · Échéance : {formatDate(debt.date_echeance)}</p>
                  </div>
                </div>
                <div className="debt-item__amount">
                  <strong>{formatXOF(Number(debt.montant_restant))}</strong>
                  <span>{debt.statut === 'payee' ? 'Remboursée' : `sur ${formatXOF(Number(debt.montant_initial))}`}</span>
                </div>
                <div className="debt-item__actions">
                  {debt.statut === 'ouverte' && <Button size="sm" variant="primary" loading={actionId === debt.id} onClick={() => markAsPaid(debt)}>Marquer payée</Button>}
                  <Button size="sm" variant="ghost" disabled={actionId === debt.id} onClick={() => removeDebt(debt)}>Supprimer</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
