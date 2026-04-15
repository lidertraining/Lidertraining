import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@shared/hooks/useAuth';
import { supabase } from '@lib/supabase';
import type { Profile } from '@ltypes/domain';

/** Query do profile do usu\u00e1rio autenticado. */
export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery<Profile | null>({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Mapeia snake_case do Postgres para camelCase do dom\u00ednio
      return mapProfile(data);
    },
    staleTime: 1000 * 30,
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapProfile(row: any): Profile {
  return {
    id: row.id,
    uplineId: row.upline_id,
    name: row.name,
    avatarUrl: row.avatar_url,
    xp: row.xp,
    level: row.level,
    streak: row.streak,
    lastActive: row.last_active,
    streakFreezeActive: row.streak_freeze_active,
    freezes: row.freezes,
    energy: row.energy,
    maxEnergy: row.max_energy,
    league: row.league,
    weeklyXP: row.weekly_xp,
    journeyStep: row.journey_step,
    firCompleted: row.fir_completed,
    firStep: row.fir_step,
    onboarded: row.onboarded,
    contacts: row.contacts,
    sales: row.sales,
    teamCount: row.team_count,
    pg: row.pg,
    pp: row.pp,
    vip: row.vip,
    commCurrent: row.comm_current,
    commProjected: row.comm_projected,
    commGoal: row.comm_goal,
    scout: row.scout,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
