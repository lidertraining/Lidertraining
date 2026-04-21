import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-expect-error — JSX sem tipagem; allowJs permite o import via Vite
import LiderAuthElite from '@/components/LiderAuthElite.jsx';
import { handleOAuthCallback } from '@lib/auth-helpers';
import { captureReferralFromURL } from '@lib/deeplink';
import { ROUTES } from '@config/routes';

/**
 * Wrapper que injeta navegação na auth elite v2.
 * Lida tanto com a tela de auth quanto com o callback OAuth do Google.
 */
export function AuthEliteRoute() {
  const nav = useNavigate();

  useEffect(() => {
    // Captura ?ref=... do link de convite (deep link)
    captureReferralFromURL().catch(() => { /* noop */ });

    // Se vier do callback OAuth, finaliza a sessão e redireciona
    if (window.location.pathname === '/auth/callback') {
      handleOAuthCallback().then(({ session }) => {
        if (session) nav(ROUTES.DASHBOARD, { replace: true });
        else nav('/auth-elite', { replace: true });
      });
    }
  }, [nav]);

  return <LiderAuthElite onSuccess={() => nav(ROUTES.DASHBOARD, { replace: true })} />;
}
