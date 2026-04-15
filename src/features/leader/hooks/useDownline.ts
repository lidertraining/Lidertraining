import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@shared/hooks/useAuth';
import { getDownline } from '../api/downline';

export function useDownline(depth = 6) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ['downline', session?.user.id, depth],
    enabled: !!session,
    queryFn: () => getDownline(depth),
  });
}
