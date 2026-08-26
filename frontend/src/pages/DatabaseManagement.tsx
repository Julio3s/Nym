import { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

type Row = Record<string, unknown>;
type Dataset = { title: string; rows: Row[]; columns: [string, string][] };

interface Overview {
  counts: Record<string, number>;
  users: Row[];
  transactions: Row[];
  budgets: Row[];
  debts: Row[];
  categories: Row[];
  revenue_sources: Row[];
}

const labels: Record<string, string> = {
  users: 'Utilisateurs', transactions: 'Transactions', budgets: 'Budgets',
  debts: 'Dettes', categories: 'Catégories', revenue_sources: 'Sources de revenus',
};

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  return String(value);
}

function DataTable({ dataset }: { dataset: Dataset }) {
  return (
    <div className="admin-table-wrap">
      {dataset.rows.length === 0 ? <p className="text-muted">Aucune donnée.</p> : (
        <table className="admin-table">
          <thead><tr>{dataset.columns.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead>
          <tbody>{dataset.rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {dataset.columns.map(([key]) => <td key={key}>{displayValue(row[key])}</td>)}
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}

export default function DatabaseManagement() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadOverview = () => {
    setLoading(true);
    api.get<Overview>('/admin/overview/')
      .then((response) => setOverview(response.data))
      .catch(() => setMessage('Impossible de charger les données de la base.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadOverview, []);

  const updateUser = async (user: Row) => {
    try {
      await api.patch(`/admin/users/${user.id}/`, { is_active: !user.is_active });
      setMessage('Statut de l’utilisateur mis à jour.');
      loadOverview();
    } catch { setMessage('Impossible de modifier cet utilisateur.'); }
  };

  const deleteUser = async (user: Row) => {
    if (!window.confirm(`Supprimer le compte ${user.email} et ses données ?`)) return;
    try {
      await api.delete(`/admin/users/${user.id}/`);
      setMessage('Utilisateur supprimé.');
      loadOverview();
    } catch { setMessage('Impossible de supprimer cet utilisateur.'); }
  };

  if (loading && !overview) return <div className="admin-page"><p>Chargement de la base...</p></div>;
  if (!overview) return <div className="admin-page"><p className="form-error">{message}</p></div>;

  const datasets: Dataset[] = [
    { title: 'Transactions', rows: overview.transactions, columns: [['id', 'ID'], ['user__email', 'Utilisateur'], ['type', 'Type'], ['montant', 'Montant'], ['categorie', 'Catégorie'], ['description', 'Description'], ['date', 'Date']] },
    { title: 'Budgets', rows: overview.budgets, columns: [['id', 'ID'], ['user__email', 'Utilisateur'], ['categorie', 'Catégorie'], ['montant', 'Montant'], ['mois', 'Mois']] },
    { title: 'Dettes', rows: overview.debts, columns: [['id', 'ID'], ['user__email', 'Utilisateur'], ['creditor', 'Créancier'], ['montant_initial', 'Initial'], ['montant_restant', 'Restant'], ['statut', 'Statut'], ['date_echeance', 'Échéance']] },
    { title: 'Catégories', rows: overview.categories, columns: [['id', 'ID'], ['user__email', 'Utilisateur'], ['name', 'Nom'], ['type', 'Type'], ['created_at', 'Créée le']] },
    { title: 'Sources de revenus', rows: overview.revenue_sources, columns: [['id', 'ID'], ['user__email', 'Utilisateur'], ['name', 'Nom'], ['default_amount', 'Montant défaut'], ['description', 'Description'], ['is_active', 'Active']] },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div><p className="admin-kicker">Accès gestionnaire</p><h1>Gestion de la base</h1><p>Vue complète des données et des comptes utilisateurs.</p></div>
        <Button variant="secondary" onClick={loadOverview} loading={loading}>Actualiser</Button>
      </div>
      {message && <p className="admin-message">{message}</p>}
      <div className="admin-counts">
        {Object.entries(overview.counts).map(([key, count]) => <div className="admin-count" key={key}><strong>{count}</strong><span>{labels[key] || key}</span></div>)}
      </div>

      <Card className="admin-section"><h2>Utilisateurs</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Compte</th><th>Nom</th><th>Transactions</th><th>Statut</th><th>Actions</th></tr></thead><tbody>
        {overview.users.map((user) => <tr key={String(user.id)}><td><strong>{displayValue(user.email)}</strong><small>{displayValue(user.username)}</small></td><td>{displayValue(`${user.prenom || ''} ${user.nom || ''}`.trim())}</td><td>{displayValue(user.total_transactions)}</td><td><span className={user.is_active === true ? 'admin-status admin-status--active' : 'admin-status'}>{user.is_active === true ? 'Actif' : 'Désactivé'}</span></td><td><div className="admin-actions"><Button size="sm" variant="secondary" disabled={user.is_superuser === true} onClick={() => updateUser(user)}>{user.is_active === true ? 'Désactiver' : 'Activer'}</Button><Button size="sm" variant="danger" disabled={user.is_superuser === true} onClick={() => deleteUser(user)}>Supprimer</Button></div></td></tr>)}
      </tbody></table></div></Card>

      {datasets.map((dataset) => <Card className="admin-section" key={dataset.title}><h2>{dataset.title}</h2><DataTable dataset={dataset} /></Card>)}
    </div>
  );
}