import { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

const primaryNav = [
  { path: '/', label: 'Accueil', icon: '⌂' },
  { path: '/expenses', label: 'Transactions', icon: '≡' },
  { path: '/revenues', label: 'Revenus', icon: '+' },
  { path: '/budgets', label: 'Budgets', icon: '◎' },
  { path: '/debts', label: 'Dettes', icon: 'D' },
  { path: '/invoices', label: 'Factures', icon: 'F' },
  { path: '/subscriptions', label: 'Abonnements', icon: 'A' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isDatabaseManager } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell app-shell--topnav">
      <header className="app-topbar">
        <Link className="app-brand" to="/" aria-label="Mny, accueil"><span>M</span><strong>Mny</strong></Link>

        <nav className="app-topnav__links" aria-label="Navigation principale">
          {primaryNav.map((item) => <Link key={item.path} to={item.path} className={isActive(item.path) ? 'is-active' : ''}>{item.label}</Link>)}
          {isDatabaseManager && <Link to="/gestion-bd" className={isActive('/gestion-bd') ? 'is-active' : ''}>Gestion BD</Link>}
        </nav>

        <div className="app-topbar__actions">
          <Link className="app-topbar__quick" to="/expenses/new">+ Dépense</Link>
          <button onClick={toggleTheme} title="Changer de thème" aria-label="Changer de thème">{theme === 'dark' ? '☀' : '◐'}</button>
          <Link className="app-user" to="/profile" title="Mon profil">{(user?.prenom || user?.username || user?.email || '?')[0].toUpperCase()}</Link>
          <button className="app-logout" onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <main className="app-content app-content--topnav"><div className="fade-in app-page">{children}</div></main>

      <nav className="app-bottomnav" aria-label="Navigation mobile">
        {primaryNav.map((item) => <Link key={item.path} to={item.path} className={isActive(item.path) ? 'is-active' : ''}><span>{item.icon}</span>{item.label}</Link>)}
      </nav>
    </div>
  );
}
