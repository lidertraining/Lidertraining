import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@shared/hooks/useAuth';
import { getMyPersonalCode } from '../api/invites';

export function useMyPersonalCode() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['personal-code', session?.user.id],
    enabled: !!session,
    queryFn: getMyPersonalCode,
    staleTime: Infinity,
  });
}
