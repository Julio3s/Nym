import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const actions = [
  { to: '/expenses/new', title: 'Ajouter une dépense', text: 'Enregistre un achat ou une sortie.', icon: '−', tone: 'home-action--expense' },
  { to: '/revenues/new', title: 'Ajouter un revenu', text: 'Ajoute un salaire, une vente ou un gain.', icon: '+', tone: 'home-action--income' },
  { to: '/expenses', title: 'Mes transactions', text: 'Consulte, recherche ou exporte tes opérations.', icon: '≡', tone: 'home-action--transactions' },
  { to: '/budgets', title: 'Mes budgets', text: 'Définis tes limites pour le mois.', icon: '◎', tone: 'home-action--budget' },
];

export default function Home() {
  const { user } = useAuth();
  const name = user?.prenom || user?.username || 'toi';

  return (
    <section className="home-page">
      <div className="home-hero">
        <p className="home-kicker">Mny · tes finances au quotidien</p>
        <h1>Bonjour, {name}.</h1>
        <p>Que veux-tu faire aujourd’hui ?</p>
      </div>

      <div className="home-actions">
        {actions.map((action) => (
          <Link key={action.to} className={`home-action ${action.tone}`} to={action.to}>
            <span className="home-action__icon" aria-hidden="true">{action.icon}</span>
            <span><strong>{action.title}</strong><small>{action.text}</small></span>
            <span className="home-action__arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>

      <Link className="home-insight" to="/dashboard">
        <span><strong>Voir le tableau de bord</strong><small>Solde, évolution et répartition de tes dépenses.</small></span>
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
