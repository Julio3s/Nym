import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  style?: React.CSSProperties;
  padding?: string;
}

export default function Card({ children, style, padding = 'var(--space-lg)' }: CardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding,
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow var(--transition-base)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}