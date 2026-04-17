import { Navigate, Outlet } from 'react-router-dom';
import { useProfile } from '@shared/hooks/useProfile';
import { PageSpinner } from '@shared/ui/PageSpinner';
import { ROUTES } from '@config/routes';

export function RequireAdmin() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) return <PageSpinner />;
  if (!profile || profile.role !== 'admin') return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <Outlet />;
}
