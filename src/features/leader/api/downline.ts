import { supabase } from '@lib/supabase';
import type { UserLevel } from '@types/domain';

export interface DownlineMember {
  id: string;
  uplineId: string | null;
  name: string;
  level: UserLevel;
  xp: number;
  streak: number;
  journeyStep: number;
  teamCount: number;
  depth: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapDownline(row: any): DownlineMember {
  return {
    id: row.id,
    uplineId: row.upline_id ?? null,
    name: row.name,
    level: row.level,
    xp: row.xp,
    streak: row.streak,
    journeyStep: row.journey_step,
    teamCount: row.team_count,
    depth: row.depth,
  };
}

export async function getDownline(depth = 6): Promise<DownlineMember[]> {
  const { data, error } = await supabase.rpc('get_downline', { p_depth: depth });
  if (error) throw error;
  return (data ?? []).map(mapDownline);
}
