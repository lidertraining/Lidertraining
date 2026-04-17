import { useQuery } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';

/**
 * Busca o telefone do membro direto da tabela profiles.
 * Fallback caso o RPC get_team_learning ainda não tenha retornado phone
 * (quando a migração 20260416200000_profile_phone.sql não foi aplicada).
 */
export function useMemberPhone(memberId: string | undefined) {
  return useQuery({
    queryKey: ['member-phone', memberId],
    enabled: !!memberId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!memberId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', memberId)
        .maybeSingle();
      if (error) return null;
      return data?.phone ?? null;
    },
  });
}
