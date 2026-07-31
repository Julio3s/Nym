import { useNavigate } from 'react-router-dom';
import Button from './Button';

interface BackButtonProps {
  to?: string;
  label?: string;
}

export default function BackButton({ to, label = '← Retour' }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      onClick={() => {
        if (to) navigate(to);
        else navigate(-1);
      }}
      style={{ marginBottom: 'var(--space-md)' }}
    >
      {label}
    </Button>
  );
}