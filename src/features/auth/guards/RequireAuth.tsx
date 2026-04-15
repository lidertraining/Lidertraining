import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@shared/hooks/useAuth';
import { ROUTES } from '@config/routes';

export function RequireAuth() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-sf-void text-on-3">
        Carregando\u2026
      </div>
    );
  }

  if (!session) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
