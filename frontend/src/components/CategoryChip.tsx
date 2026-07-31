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
  autres: '#64748b',
};

export default function CategoryChip({ category, selected, onClick }: CategoryChipProps) {
  const color = categoryColors[category.toLowerCase()] || categoryColors.autres;

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