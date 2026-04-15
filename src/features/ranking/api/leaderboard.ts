import { supabase } from '@lib/supabase';
import type { League, UserLevel } from '@ltypes/domain';

export interface LeaderboardEntry {
  id: string;
  name: string;
  level: UserLevel;
  weeklyXP: number;
  xp: number;
  league: League;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapEntry(row: any): LeaderboardEntry {
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    weeklyXP: row.weekly_xp ?? 0,
    xp: row.xp ?? 0,
    league: row.league,
  };
}

export async function getWeeklyLeaderboard(league: League): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, level, weekly_xp, xp, league')
    .eq('league', league)
    .order('weekly_xp', { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []).map(mapEntry);
}
