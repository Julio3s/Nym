import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/expenses', label: 'Transactions', icon: '💸' },
  { path: '/revenues', label: 'Revenus', icon: '💰' },
  { path: '/budgets', label: 'Budgets', icon: '🎯' },
  { path: '/profile', label: 'Profil', icon: '👤' },
];

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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '72px',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        transition: 'width var(--transition-base)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--color-border)',
          minHeight: '64px',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 800, color: 'white', flexShrink: 0,
          }}>M</div>
          {sidebarOpen && <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>Mny</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
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

        {/* Toggle sidebar */}
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

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
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
          {theme === 'dark' ? '☀️' : '🌙'}
          {sidebarOpen && <span style={{ fontSize: 'var(--font-size-sm)' }}>{theme === 'dark' ? 'Clair' : 'Sombre'}</span>}
        </button>

        {/* User & Logout */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid var(--color-border)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '8px', borderRadius: 'var(--radius-md)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 600, fontSize: 14, flexShrink: 0,
            }}>
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
              marginTop: 8, width: '100%', padding: '10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              fontWeight: 600, fontSize: 'var(--font-size-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all var(--transition-fast)',
            }}
          >
            🚪 {sidebarOpen && 'Déconnexion'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: sidebarOpen ? '240px' : '72px',
        flex: 1,
        transition: 'margin-left var(--transition-base)',
        minHeight: '100vh',
      }}>
        <div className="fade-in" style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}