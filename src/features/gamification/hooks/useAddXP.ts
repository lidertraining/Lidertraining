import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addXP } from '../api/addXP';
import { useToast } from '@shared/hooks/useToast';

interface AddXPInput {
  amount: number;
  reason?: string;
}

/** Muta\u00e7\u00e3o para conceder XP com toast autom\u00e1tico e invalida\u00e7\u00e3o do profile. */
export function useAddXP() {
  const qc = useQueryClient();
  const { xp: xpToast } = useToast();

  return useMutation({
    mutationFn: ({ amount, reason }: AddXPInput) => addXP(amount, reason),
    onSuccess: (_, { amount, reason }) => {
      xpToast(amount, reason);
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
