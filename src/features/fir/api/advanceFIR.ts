import { supabase } from '@lib/supabase';
import { addXP } from '@features/gamification/api/addXP';

/**
 * Avança uma etapa do FIR, concede XP via RPC e marca fir_completed quando atinge 8.
 */
export async function advanceFIR(nextStep: number, rewardXP: number, title: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sem sessão');

  const updates: Record<string, unknown> = { fir_step: nextStep };
  if (nextStep >= 8) updates.fir_completed = true;

  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
  if (error) throw error;

  await addXP(rewardXP, `FIR: ${title}`);
}
