import type { CareerLevel } from '@ltypes/content';

/** N\u00edveis de carreira, XP threshold e visual. */
export const CAREER: CareerLevel[] = [
  { name: 'Master', xp: 0, color: 'on-3', icon: 'workspace_premium' },
  { name: 'Prata', xp: 2000, color: 'on-2', icon: 'workspace_premium' },
  { name: 'Ouro', xp: 5000, color: 'gd', icon: 'workspace_premium' },
  { name: 'Diamante', xp: 10000, color: 'dia', icon: 'diamond' },
  { name: 'Elite', xp: 20000, color: 'am', icon: 'military_tech' },
];

/** Retorna n\u00edvel atual e pr\u00f3ximo dado o XP. */
export function getCareerProgress(xp: number) {
  let current = CAREER[0]!;
  let next: CareerLevel | null = null;

  for (let i = 0; i < CAREER.length; i++) {
    const level = CAREER[i]!;
    if (xp >= level.xp) {
      current = level;
      next = CAREER[i + 1] ?? null;
    }
  }

  const progress = next ? ((xp - current.xp) / (next.xp - current.xp)) * 100 : 100;

  return { current, next, progress: Math.max(0, Math.min(100, progress)) };
}
