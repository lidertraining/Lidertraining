import { supabase } from '@lib/supabase';
import type { UserLevel } from '@ltypes/domain';

export interface TeamLearningMember {
  id: string;
  uplineId: string | null;
  name: string;
  phone: string | null;
  level: UserLevel;
  depth: number;
  journeyStep: number;
  firStep: number;
  firCompleted: boolean;
  streak: number;
  weeklyXP: number;
  xp: number;
  lastActive: string | null;
  audiosDone: number;
  audiosTotal: number;
  notesWritten: number;
  leadsCount: number;
  daysSinceActive: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function map(row: any): TeamLearningMember {
  return {
    id: row.id,
    uplineId: row.upline_id,
    name: row.name,
    phone: row.phone ?? null,
    level: row.level,
    depth: row.depth,
    journeyStep: row.journey_step,
    firStep: row.fir_step,
    firCompleted: row.fir_completed,
    streak: row.streak,
    weeklyXP: row.weekly_xp ?? 0,
    xp: row.xp ?? 0,
    lastActive: row.last_active,
    audiosDone: row.audios_done,
    audiosTotal: row.audios_total,
    notesWritten: row.notes_written,
    leadsCount: row.leads_count,
    daysSinceActive: row.days_since_active,
  };
}

export async function getTeamLearning(depth = 6): Promise<TeamLearningMember[]> {
  const { data, error } = await supabase.rpc('get_team_learning', { p_depth: depth });
  if (error) throw error;
  return (data ?? []).map(map);
}

export async function getMemberLearning(id: string): Promise<TeamLearningMember | null> {
  const all = await getTeamLearning(6);
  return all.find((m) => m.id === id) ?? null;
}
