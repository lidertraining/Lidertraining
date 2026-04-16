import { supabase } from '@lib/supabase';
import { unescapeUnicode } from '@lib/unescape';
import type { Mission, MissionType } from '@ltypes/domain';

interface MissionWithProgress extends Mission {
  progress: number;
  completedAt: string | null;
  expiresAt: string | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapMission(row: any): MissionWithProgress {
  return {
    id: row.id,
    name: unescapeUnicode(row.name),
    description: unescapeUnicode(row.description),
    type: row.type as MissionType,
    target: row.target,
    rewardXP: row.reward_xp,
    durationSeconds: row.duration_seconds,
    requirements: row.requirements,
    progress: row.user_missions?.[0]?.progress ?? 0,
    completedAt: row.user_missions?.[0]?.completed_at ?? null,
    expiresAt: row.user_missions?.[0]?.expires_at ?? null,
  };
}

export async function listActiveMissions(userId: string): Promise<MissionWithProgress[]> {
  const { data, error } = await supabase
    .from('missions')
    .select(
      `
      id, name, description, type, target, reward_xp, duration_seconds, requirements,
      user_missions!left (progress, completed_at, expires_at)
    `,
    )
    .eq('active', true)
    .eq('user_missions.user_id', userId)
    .order('type');

  if (error) throw error;
  return (data ?? []).map(mapMission);
}

export type { MissionWithProgress };
