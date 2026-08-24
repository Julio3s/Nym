import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, type Summary } from '../services/dashboardService';
import { expenseService, type Expense } from '../services/expenseService';

const formatXOF = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value);
const isoToday = () => new Date().toISOString().slice(0, 10);
const isoMonthStart = () => `${new Date().toISOString().slice(0, 7)}-01`;

export default function Home() {
  const [startDate, setStartDate] = useState(isoMonthStart);
  const [endDate, setEndDate] = useState(isoToday);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [generalSummary, setGeneralSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([
      dashboardService.getSummary({ date_debut: startDate, date_fin: endDate }),
      dashboardService.getSummary(),
      expenseService.list({ date_debut: startDate, date_fin: endDate, page: 1, ordering: '-date' }),
    ])
      .then(([summaryData, generalSummaryData, transactionsData]) => {
        if (!active) return;
        setSummary(summaryData);
        setGeneralSummary(generalSummaryData);
        setTransactions(transactionsData.results);
      })
      .catch(() => active && setError('Impossible de charger cet historique.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [startDate, endDate]);

  const period = summary?.period;
  const generalBalance = generalSummary?.solde || 0;
  return (
    <section className="home-page home-page--balance">
      <div className="balance-header">
        <div>
          <p className="home-kicker">Vue d’ensemble</p>
          <h1>Mon solde</h1>
          <p>Suivi de tes entrées et sorties d’argent.</p>
        </div>
        <div className="balance-actions">
          <Link to="/revenues/new" className="balance-action balance-action--income">+ Entrée</Link>
          <Link to="/expenses/new" className="balance-action balance-action--expense">− Sortie</Link>
        </div>
      </div>

      <div className="balance-total">
        <span>Solde général du compte</span>
        <strong className={generalBalance < 0 ? 'text-danger' : ''}>{loading ? '…' : formatXOF(generalBalance)}</strong>
        <small>Depuis la création de ton compte</small>
      </div>

      <div className="history-filter" aria-label="Filtrer les entrées et les sorties">
        <div><label htmlFor="history-start">Du</label><input id="history-start" type="date" value={startDate} max={endDate} onChange={(event) => setStartDate(event.target.value)} /></div>
        <div><label htmlFor="history-end">Au</label><input id="history-end" type="date" value={endDate} min={startDate} max={isoToday()} onChange={(event) => setEndDate(event.target.value)} /></div>
        <button type="button" onClick={() => { setStartDate(isoMonthStart()); setEndDate(isoToday()); }}>Ce mois</button>
      </div>

      <div className="balance-summary-grid">
        <article className="balance-summary balance-summary--income"><span className="balance-sign">+</span><div><small>Entrées</small><strong>{loading ? '…' : formatXOF(period?.revenus || 0)}</strong></div></article>
        <article className="balance-summary balance-summary--expense"><span className="balance-sign">−</span><div><small>Sorties</small><strong>{loading ? '…' : formatXOF(period?.depenses || 0)}</strong></div></article>
      </div>

      <section className="history-section">
        <div className="history-section__head"><div><h2>Historique</h2><p>Les opérations de la période choisie.</p></div><Link to="/expenses">Voir toutes les transactions →</Link></div>
        {error ? <p className="text-danger">{error}</p> : loading ? <p className="text-muted">Chargement de l’historique…</p> : transactions.length === 0 ? <p className="text-muted">Aucune opération enregistrée.</p> : (
          <div className="history-table-wrap"><table className="history-table"><thead><tr><th>Date</th><th>Libellé</th><th>Type</th><th>Montant</th></tr></thead><tbody>
            {transactions.map((transaction) => { const isIncome = transaction.type === 'revenu'; return <tr key={transaction.id}><td>{new Date(`${transaction.date}T00:00:00`).toLocaleDateString('fr-FR')}</td><td><strong>{transaction.category_name || transaction.categorie || 'Sans catégorie'}</strong>{transaction.description && <small>{transaction.description}</small>}</td><td><span className={isIncome ? 'history-type history-type--income' : 'history-type history-type--expense'}>{isIncome ? '+ Entrée' : '− Sortie'}</span></td><td className={isIncome ? 'history-amount history-amount--income' : 'history-amount history-amount--expense'}>{isIncome ? '+' : '−'}{formatXOF(Number(transaction.montant))}</td></tr>; })}
          </tbody></table></div>
        )}
      </section>
    </section>
  );
}
