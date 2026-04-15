import { supabase } from '@lib/supabase';

/**
 * \u00danico canal para conceder XP ao usu\u00e1rio.
 * Chama a RPC add_xp que atualiza profiles, promove n\u00edvel se aplic\u00e1vel,
 * cria notificações e insere evento no feed.
 */
export async function addXP(amount: number, reason?: string) {
  const { data, error } = await supabase.rpc('add_xp', {
    p_amount: amount,
    p_reason: reason ?? null,
  });
  if (error) throw error;
  return data;
}
