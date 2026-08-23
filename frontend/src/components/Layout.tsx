import { type CSSProperties, type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/expenses', label: 'Transactions', icon: '💸' },
  { path: '/revenues', label: 'Revenus', icon: '💰' },
  { path: '/budgets', label: 'Budgets', icon: '🎯' },
  { path: '/revenue-sources', label: 'Sources de revenus', icon: '🏦' },
  { path: '/profile', label: 'Profil', icon: '👤' },
];

const fallingStickers = [
  { icon: '📈', label: 'GRAPHE', left: '4%', top: '-12%', duration: '18s', delay: '0s', width: '128px', drift: '24px', rotate: '-12deg', opacity: '0.55' },
  { icon: '🧾', label: 'FACTURE', left: '13%', top: '6%', duration: '22s', delay: '3s', width: '136px', drift: '-18px', rotate: '8deg', opacity: '0.5' },
  { icon: '💼', label: 'TRAVAIL', left: '21%', top: '-18%', duration: '20s', delay: '1s', width: '124px', drift: '36px', rotate: '-4deg', opacity: '0.58' },
  { icon: '📄', label: 'DOSSIER', left: '32%', top: '12%', duration: '24s', delay: '6s', width: '132px', drift: '-28px', rotate: '10deg', opacity: '0.48' },
  { icon: '🧮', label: 'BUDGET', left: '40%', top: '-10%', duration: '19s', delay: '4s', width: '118px', drift: '16px', rotate: '-14deg', opacity: '0.53' },
  { icon: '📊', label: 'STATS', left: '49%', top: '24%', duration: '21s', delay: '2s', width: '122px', drift: '30px', rotate: '5deg', opacity: '0.52' },
  { icon: '🛠️', label: 'CHANTIER', left: '58%', top: '-16%', duration: '23s', delay: '5s', width: '140px', drift: '-14px', rotate: '-8deg', opacity: '0.47' },
  { icon: '📁', label: 'SUIVI', left: '66%', top: '9%', duration: '18s', delay: '7s', width: '116px', drift: '22px', rotate: '12deg', opacity: '0.57' },
  { icon: '💳', label: 'PAIEMENT', left: '74%', top: '-8%', duration: '25s', delay: '1.5s', width: '140px', drift: '-30px', rotate: '-10deg', opacity: '0.5' },
  { icon: '🧾', label: 'REÇU', left: '82%', top: '18%', duration: '20s', delay: '4.5s', width: '114px', drift: '20px', rotate: '6deg', opacity: '0.56' },
  { icon: '📈', label: 'CROISSANCE', left: '88%', top: '-14%', duration: '26s', delay: '8s', width: '150px', drift: '-26px', rotate: '4deg', opacity: '0.45' },
  { icon: '📋', label: 'CHECKLIST', left: '6%', top: '38%', duration: '27s', delay: '9s', width: '136px', drift: '18px', rotate: '14deg', opacity: '0.43' },
];

type Sticker = typeof fallingStickers[number];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="sticker-rain" aria-hidden="true">
        {fallingStickers.map((sticker: Sticker, index) => (
          <div
            key={`${sticker.label}-${index}`}
            className="sticker-rain__item"
            style={{
              left: sticker.left,
              top: sticker.top,
              width: sticker.width,
              animationDuration: sticker.duration,
              animationDelay: sticker.delay,
              '--sticker-drift': sticker.drift,
              '--sticker-rotate': sticker.rotate,
              '--sticker-opacity': sticker.opacity,
            } as CSSProperties}
          >
            <span className="sticker-rain__icon">{sticker.icon}</span>
            <span className="sticker-rain__text">
              <span className="sticker-rain__label">{sticker.label}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="app-shell">
        {sidebarOpen && <button className="app-overlay" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu" />}

        <aside className={`app-sidebar ${sidebarOpen ? 'app-sidebar--open' : ''}`}>
          <div
            style={{
              padding: '20px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid var(--color-border)',
              minHeight: '64px',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 800,
                color: 'white',
                flexShrink: 0,
              }}
            >
              M
            </div>
            {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', flex: 1 }}>Mny</span>}
            {!sidebarOpen && <span style={{ flex: 1 }} />}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              aria-label="Changer de thème"
              style={{
                marginLeft: 'auto',
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: active ? 'var(--color-primary-light)' : 'transparent',
                    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: active ? 600 : 500,
                    fontSize: 'var(--font-size-sm)',
                    transition: 'all var(--transition-fast)',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                  title={item.label}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '12px',
              borderTop: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {sidebarOpen ? '◀ Réduire' : '▶'}
          </button>

          <div
            style={{
              padding: '16px 12px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {(user?.username || user?.email || '?')[0].toUpperCase()}
              </div>
              {sidebarOpen && (
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.prenom || user?.username}
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-danger-light)',
                color: 'var(--color-danger)',
                fontWeight: 600,
                fontSize: 'var(--font-size-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all var(--transition-fast)',
              }}
            >
              🚪 {sidebarOpen && 'Déconnexion'}
            </button>
          </div>
        </aside>

        <main className={`app-content ${sidebarOpen ? 'app-content--expanded' : ''}`}>
          <div
            className="app-sidebar__mobilebar"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 80,
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: 'var(--color-surface)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <button
              onClick={() => setSidebarOpen((open) => !open)}
              style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
              aria-label="Ouvrir le menu"
            >
              ☰
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 'var(--font-size-base)', lineHeight: 1.2 }}>Mny</strong>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {user?.prenom || user?.username || user?.email}
              </span>
            </div>
          </div>

          <div className="fade-in app-page">{children}</div>
        </main>
      </div>
    </>
  );
}
