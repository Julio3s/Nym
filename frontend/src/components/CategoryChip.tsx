interface CategoryChipProps {
  category: string;
  selected?: boolean;
  onClick?: () => void;
}

const categoryColors: Record<string, string> = {
  alimentation: '#16a34a',
  transport: '#2563eb',
  logement: '#f59e0b',
  loisirs: '#8b5cf6',
  sante: '#dc2626',
  education: '#06b6d4',
  shopping: '#ec4899',
  salaire: '#16a34a',
  freelancing: '#0ea5e9',
  freelance: '#0ea5e9',
  investissement: '#8b5cf6',
  vente: '#f59e0b',
  autres: '#64748b',
};

const FALLBACK_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#64748b'];

function categoryColor(name: string): string {
  const known = categoryColors[name.toLowerCase()];
  if (known) return known;
  // Couleur stable dérivée du nom pour les catégories personnalisées.
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

export default function CategoryChip({ category, selected, onClick }: CategoryChipProps) {
  const color = categoryColor(category);

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-xs)',
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)',
        backgroundColor: selected ? color : 'var(--color-bg-tertiary)',
        color: selected ? '#ffffff' : color,
        border: `1px solid ${color}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--transition-fast)',
        textTransform: 'capitalize',
      }}
    >
      {category}
    </span>
  );
}