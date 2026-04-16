import { supabase } from '@lib/supabase';

/**
 * Marca um passo do FIR como concluído (em qualquer ordem).
 * A RPC é idempotente: se o passo já estava marcado, não concede XP de novo.
 */
export async function advanceFIR(stepId: number, rewardXP: number, _title: string) {
  const { error } = await supabase.rpc('complete_fir_step', {
    p_step: stepId,
    p_reward: rewardXP,
  });
  if (error) throw error;
}
