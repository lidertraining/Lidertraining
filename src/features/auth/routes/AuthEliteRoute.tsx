import { useEffect } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import LiderAuthEliteRaw from '@/components/LiderAuthElite.jsx';
import { captureReferralFromURL } from '@lib/deeplink';
import { ROUTES } from '@config/routes';

const LiderAuthElite = LiderAuthEliteRaw as ComponentType<{ onSuccess?: () => void }>;

/**
 * Wrapper da tela de auth elite v2 (LiderAuthElite).
 * Captura ?ref=... da URL no mount. O callback OAuth tem sua propria
 * pagina (AuthCallback) — separacao de responsabilidades.
 */
export function AuthEliteRoute() {
  const nav = useNavigate();

  useEffect(() => {
    captureReferralFromURL().catch(() => { /* noop */ });
  }, []);

  return <LiderAuthElite onSuccess={() => nav(ROUTES.DASHBOARD, { replace: true })} />;
}
