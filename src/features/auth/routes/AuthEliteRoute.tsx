import { useEffect } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import LiderAuthEliteRaw from '@/components/LiderAuthElite.jsx';
import { handleOAuthCallback } from '@lib/auth-helpers';
import { captureReferralFromURL } from '@lib/deeplink';
import { ROUTES } from '@config/routes';

const LiderAuthElite = LiderAuthEliteRaw as ComponentType<{ onSuccess?: () => void }>;

/**
 * Wrapper que injeta navegação na auth elite v2.
 * Lida tanto com a tela de auth quanto com o callback OAuth do Google.
 */
export function AuthEliteRoute() {
  const nav = useNavigate();

  useEffect(() => {
    captureReferralFromURL().catch(() => { /* noop */ });

    if (window.location.pathname === '/auth/callback') {
      handleOAuthCallback().then(({ session }) => {
        if (session) nav(ROUTES.DASHBOARD, { replace: true });
        else nav('/auth-elite', { replace: true });
      });
    }
  }, [nav]);

  return <LiderAuthElite onSuccess={() => nav(ROUTES.DASHBOARD, { replace: true })} />;
}
