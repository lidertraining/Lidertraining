import { supabase } from '@lib/supabase';

/**
 * \u00danico canal para conceder XP ao usuário.
 * Chama a RPC add_xp que atualiza profiles, promove nível se aplicável,
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
