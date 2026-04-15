import { supabase } from '@lib/supabase';

/** Chamado no boot do app: incrementa streak se for um novo dia. */
export async function tickStreak() {
  const { data, error } = await supabase.rpc('tick_streak');
  if (error) throw error;
  return data;
}

/** Recarrega energia (1 por hora). */
export async function refillEnergy() {
  const { data, error } = await supabase.rpc('refill_energy');
  if (error) throw error;
  return data;
}
