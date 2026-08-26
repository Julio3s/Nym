import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export function DatabaseManagerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isDatabaseManager, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Chargement...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isDatabaseManager) return <Navigate to="/" state={{ from: location }} replace />;
  return <>{children}</>;
}