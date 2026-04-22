import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const processarCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const errorDescription = url.searchParams.get('error_description');

        if (errorDescription) {
          console.error('OAuth error:', errorDescription);
          navigate('/auth-elite?error=oauth_failed', { replace: true });
          return;
        }

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Exchange error:', error);
            navigate('/auth-elite?error=oauth_failed', { replace: true });
            return;
          }
          if (data.session) {
            navigate('/', { replace: true });
            return;
          }
        }

        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate('/', { replace: true });
        } else {
          navigate('/auth-elite?error=no_session', { replace: true });
        }
      } catch (err) {
        console.error('Callback error:', err);
        navigate('/auth-elite?error=callback_failed', { replace: true });
      }
    };

    processarCallback();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0e0e10',
      color: '#e5e1e4',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#c9a0ff', marginBottom: 8 }}>
          Finalizando login...
        </div>
        <div style={{ fontSize: 12, color: '#9b97a0' }}>
          Aguarde um instante
        </div>
      </div>
    </div>
  );
}
