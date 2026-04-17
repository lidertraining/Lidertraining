import { useQuery } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { useAuth } from '@shared/hooks/useAuth';
import type { Conhecimento } from '../components/ConhecimentoPlayer';

interface Filters {
  tipo?: Conhecimento['tipo'];
  passo_jornada?: number;
  categoria?: string;
}

export function useConhecimentos(filters: Filters = {}) {
  const { session } = useAuth();
  const uid = session?.user.id;

  return useQuery({
    queryKey: ['conhecimentos', filters, uid],
    enabled: !!uid,
    staleTime: 60_000,
    queryFn: async () => {
      let q = supabase
        .from('conhecimentos')
        .select('*, conhecimento_consumo!left(progresso_pct, posicao_segundos, concluido)')
        .eq('ativo', true)
        .order('obrigatorio', { ascending: false })
        .order('ordem');

      if (filters.tipo) q = q.eq('tipo', filters.tipo);
      if (filters.passo_jornada !== undefined) q = q.eq('passo_jornada', filters.passo_jornada);
      if (filters.categoria) q = q.eq('categoria', filters.categoria);
      if (uid) q = q.eq('conhecimento_consumo.user_id', uid);

      const { data, error } = await q;
      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((row: any) => {
        const consumo = row.conhecimento_consumo?.[0] ?? null;
        return {
          ...row,
          consumo: consumo
            ? {
                progresso_pct: consumo.progresso_pct,
                posicao_segundos: consumo.posicao_segundos,
                concluido: consumo.concluido,
              }
            : null,
        };
      });
    },
  });
}
