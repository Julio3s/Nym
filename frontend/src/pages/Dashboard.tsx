import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { expenseService, type Expense } from '../services/expenseService';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#64748b'];

const formatXOF = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(value);

export default function Dashboard() {
  const { user } = useAuth();
  const { summary, categories, timeline, loading } = useDashboard();
  const [recentRevenues, setRecentRevenues] = useState<Expense[]>([]);

  useEffect(() => {
    expenseService.list({ type: 'revenu', page: 1, ordering: '-date' }).then((data) => {
      setRecentRevenues(data.results.slice(0, 5));
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Solde', value: summary?.solde || 0, icon: '💎', gradient: 'var(--gradient-primary)', color: (summary?.solde || 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)' },
    { label: "Dépenses aujourd'hui", value: summary?.today.depenses || 0, icon: '📉', gradient: 'var(--gradient-danger)', color: 'var(--color-text)' },
    { label: 'Dépenses ce mois', value: summary?.month.depenses || 0, icon: '📊', gradient: 'var(--gradient-primary)', color: 'var(--color-text)' },
    { label: 'Revenus ce mois', value: summary?.month.revenus || 0, icon: '💰', gradient: 'var(--gradient-success)', color: 'var(--color-success)' },
  ];

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-page__header" style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 800, marginBottom: '4px' }}>
          Bonjour, {user?.prenom || user?.username} 👋
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
          Voici un aperçu de vos finances
        </p>
      </div>

      {/* Cards */}
      <div className="dashboard-stats-grid">
        {cards.map((card, i) => (
            <div key={i} className="dashboard-stat-card" style={{
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--color-border)',
            transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
            cursor: 'default',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div className="dashboard-stat-card__icon" style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: card.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>{card.icon}</div>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{card.label}</p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: card.color }}>
              {loading ? '...' : formatXOF(card.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="page-header-actions dashboard-actions" style={{ marginBottom: '32px' }}>
        <Link to="/expenses/new"><button className="dashboard-action dashboard-action--primary" style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', color: 'white', fontWeight: 600, fontSize: 'var(--font-size-sm)', boxShadow: 'var(--shadow-primary)' }}>+ Dépense</button></Link>
        <Link to="/revenues/new"><button className="dashboard-action dashboard-action--success" style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-success)', color: 'white', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>+ Revenu</button></Link>
        <Link to="/budgets"><button className="dashboard-action dashboard-action--neutral" style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>🎯 Budgets</button></Link>
      </div>

      {/* Charts */}
      <div className="dashboard-charts-grid">
        {/* Pie */}
        <div className="dashboard-panel" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: 'var(--font-size-lg)' }}>Répartition des dépenses par catégorie</h3>
          {loading ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>Chargement...</p> :
           categories.length === 0 ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>Aucune dépense ce mois</p> :
           <ResponsiveContainer width="100%" height={280}>
             <PieChart>
               <Pie data={categories} dataKey="total" nameKey="categorie" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}
                 label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                 {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
               </Pie>
               <Tooltip formatter={(v: any) => formatXOF(Number(v))} />
             </PieChart>
           </ResponsiveContainer>}
        </div>

        {/* Line */}
        <div className="dashboard-panel" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '20px', fontSize: 'var(--font-size-lg)' }}>Évolution mensuelle des dépenses</h3>
          {loading ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>Chargement...</p> :
           timeline.length === 0 ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>Aucune donnée</p> :
           <ResponsiveContainer width="100%" height={280}>
             <LineChart data={timeline}>
               <defs><linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
               <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
               <XAxis dataKey="mois" stroke="var(--color-text-muted)" fontSize={12} />
               <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
               <Tooltip formatter={(v: any) => formatXOF(Number(v))} />
               <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} activeDot={{ r: 8 }} />
             </LineChart>
           </ResponsiveContainer>}
        </div>
      </div>

      {/* Recent revenues */}
      <div className="dashboard-panel dashboard-panel--recent" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)' }}>
          <div className="card-row" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)' }}>Derniers revenus</h3>
          <Link to="/revenues" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Voir tout →</Link>
        </div>
        {recentRevenues.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 24 }}>Aucun revenu enregistré</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentRevenues.map((rev) => (
              <div key={rev.id} className="card-row" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', transition: 'background var(--transition-fast)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💰</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', textTransform: 'capitalize' }}>{rev.categorie}</p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{new Date(rev.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: 'var(--font-size-base)' }}>+{formatXOF(parseFloat(String(rev.montant)))}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
