import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@lib/supabase';
import { handleOAuthCallback } from '@lib/auth-helpers';
import { ROUTES } from '@config/routes';

/**
 * Página dedicada ao retorno do OAuth (Google, Apple).
 * O Supabase detecta o code/token na URL automaticamente (detectSessionInUrl=true)
 * e troca por uma sessão válida. Aqui só esperamos a sessão e redirecionamos.
 */
export function AuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Aguarda o Supabase processar a URL (token/code → sessão)
        await handleOAuthCallback();
        const { data } = await supabase.auth.getSession();

        if (cancelled) return;

        if (data.session) {
          nav(ROUTES.DASHBOARD, { replace: true });
        } else {
          nav('/auth-elite?error=oauth_failed', { replace: true });
        }
      } catch (err) {
        console.error('[auth/callback] erro processando retorno OAuth:', err);
        if (!cancelled) nav('/auth-elite?error=oauth_failed', { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nav]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-sf-void">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-am border-t-transparent" />
        <div className="text-sm text-on-3">Finalizando login…</div>
      </div>
    </div>
  );
}
