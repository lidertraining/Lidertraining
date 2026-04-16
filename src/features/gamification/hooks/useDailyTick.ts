import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { tickStreak, refillEnergy } from '../api/tickStreak';
import { useAuth } from '@shared/hooks/useAuth';

/**
 * Dispara no mount do app autenticado:
 * 1) tick_streak — incrementa streak se for novo dia
 * 2) refill_energy — recarrega energia baseado em horas passadas
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
        // Silencioso: não é crítico; se falhar, tenta de novo no próximo mount
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, qc]);
}
