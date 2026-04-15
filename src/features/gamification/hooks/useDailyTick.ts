import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { tickStreak, refillEnergy } from '../api/tickStreak';
import { useAuth } from '@shared/providers/AuthProvider';

/**
 * Dispara no mount do app autenticado:
 * 1) tick_streak \u2014 incrementa streak se for novo dia
 * 2) refill_energy \u2014 recarrega energia baseado em horas passadas
 */
export function useDailyTick() {
  const { session } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([tickStreak(), refillEnergy()]);
        if (!cancelled) qc.invalidateQueries({ queryKey: ['profile'] });
      } catch {
        // Silencioso: n\u00e3o \u00e9 cr\u00edtico; se falhar, tenta de novo no pr\u00f3ximo mount
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, qc]);
}
