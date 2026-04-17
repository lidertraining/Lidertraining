import { useEffect, useRef } from 'react';
import { useProfile } from '@shared/hooks/useProfile';
import { useAddXP } from './useAddXP';

const STORAGE_KEY = 'lt_streak_milestones_claimed';
const MILESTONES = [3, 5, 7, 10, 14, 21, 30, 60, 90, 180, 365];

/**
 * Concede XP bonus ao bater milestones de streak (3, 5, 7, 10, 14, 21, 30...).
 * Usa localStorage para evitar creditar duas vezes.
 */
export function useStreakMilestones() {
  const { data: profile } = useProfile();
  const { mutate: addXP } = useAddXP();
  const processed = useRef(false);

  useEffect(() => {
    if (!profile || processed.current) return;
    const streak = profile.streak;
    if (streak <= 0) return;

    const claimed: number[] = (() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as number[]) : [];
      } catch {
        return [];
      }
    })();

    // Encontra maior milestone atingido que ainda não foi creditado
    const pending = MILESTONES.filter((m) => streak >= m && !claimed.includes(m));
    if (pending.length === 0) {
      processed.current = true;
      return;
    }

    // Credita apenas o MAIOR pendente (evita spam de XP se a pessoa voltou ao app)
    const top = pending[pending.length - 1]!;
    const reward = top * 10 + 50; // ex: 3d=80, 7d=120, 21d=260, 30d=350
    addXP({ amount: reward, reason: `Streak ${top} dias 🔥` });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...claimed, ...pending]));
    } catch {
      /* empty */
    }

    processed.current = true;
  }, [profile, addXP]);
}
