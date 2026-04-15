import { useQuery } from '@tanstack/react-query';
import type { League } from '@types/domain';
import { getWeeklyLeaderboard } from '../api/leaderboard';

export function useLeaderboard(league: League) {
  return useQuery({
    queryKey: ['leaderboard', league],
    queryFn: () => getWeeklyLeaderboard(league),
    staleTime: 1000 * 60, // 1min
  });
}
