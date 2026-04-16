import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useProfile } from '@shared/hooks/useProfile';
import { ROUTES } from '@config/routes';

export function RequireOnboarded() {
  const { data: profile, isLoading } = useProfile();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-sf-void text-on-3">
        Carregando perfil…
      </div>
    );
  }

  if (!profile || !profile.onboarded) {
    if (location.pathname === ROUTES.ONBOARDING) return <Outlet />;
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  return <Outlet />;
}
