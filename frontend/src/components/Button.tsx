import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

const styles = {
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-text-inverse)',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'var(--color-bg-tertiary)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  danger: {
    backgroundColor: 'var(--color-danger)',
    color: 'var(--color-text-inverse)',
    border: 'none',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    border: 'none',
  },
};

const sizes = {
  sm: { padding: '6px 12px', fontSize: 'var(--font-size-sm)' },
  md: { padding: '8px 16px', fontSize: 'var(--font-size-base)' },
  lg: { padding: '12px 24px', fontSize: 'var(--font-size-lg)' },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-sm)',
        borderRadius: 'var(--radius-md)',
        fontWeight: 'var(--font-weight-medium)',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'all var(--transition-fast)',
        ...styles[variant],
        ...sizes[size],
        ...style,
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner" />}
      {children}
    </button>
  );
}