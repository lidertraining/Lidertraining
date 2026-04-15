import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@shared/hooks/useAuth';
import { listActiveMissions } from '../api/missions';

export function useMissions() {
  const { session } = useAuth();
  const uid = session?.user.id;

  return useQuery({
    queryKey: ['missions', uid],
    enabled: !!uid,
    queryFn: () => (uid ? listActiveMissions(uid) : Promise.resolve([])),
  });
}
