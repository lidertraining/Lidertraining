import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@shared/hooks/useAuth';
import { getTeamLearning } from '../api/teamLearning';

export function useTeamLearning(depth = 6) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['team-learning', session?.user.id, depth],
    enabled: !!session,
    queryFn: () => getTeamLearning(depth),
    staleTime: 30_000,
  });
}
