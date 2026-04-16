import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@shared/hooks/useAuth';
import { listAudios, markAudioComplete } from '../api/audios';
import { useAddXP } from '@features/gamification/hooks/useAddXP';

export function useAudios() {
  const { session } = useAuth();
  const uid = session?.user.id;
  return useQuery({
    queryKey: ['audios', uid],
    enabled: !!uid,
    queryFn: () => (uid ? listAudios(uid) : Promise.resolve([])),
  });
}

export function useMarkAudioComplete() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const uid = session?.user.id;
  const { mutate: addXP } = useAddXP();

  return useMutation({
    mutationFn: async ({ audioId, title }: { audioId: string; title: string }) => {
      if (!uid) throw new Error('Sem sessão');
      await markAudioComplete(uid, audioId);
      return title;
    },
    onSuccess: (title) => {
      qc.invalidateQueries({ queryKey: ['audios'] });
      addXP({ amount: 25, reason: `\u00c1udio: ${title}` });
    },
  });
}
