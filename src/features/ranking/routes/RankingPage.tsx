import { useState } from 'react';
import type { League } from '@ltypes/domain';
import { useProfile } from '@shared/hooks/useProfile';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { LeagueSelector } from '../components/LeagueSelector';
import { Podium } from '../components/Podium';
import { LeaderboardList } from '../components/LeaderboardList';
import { PromotionZones } from '../components/PromotionZones';
import { EmptyState } from '@shared/ui/EmptyState';

export function RankingPage() {
  const { data: profile } = useProfile();
  const [league, setLeague] = useState<League>(profile?.league ?? 'Bronze');
  const { data: entries = [], isLoading } = useLeaderboard(league);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <header className="animate-fade-up">
        <div className="text-sm text-on-3">Competi\u00e7\u00e3o semanal</div>
        <h1 className="serif text-3xl font-bold">Ranking</h1>
      </header>

      <LeagueSelector active={league} onChange={setLeague} />

      {isLoading ? (
        <div className="py-6 text-center text-xs text-on-3">Carregando ranking\u2026</div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon="emoji_events"
          title="Sem participantes nesta liga"
          description="Volte depois que a semana come\u00e7ar."
        />
      ) : (
        <>
          <Podium entries={entries} currentUserId={profile?.id} />
          <PromotionZones />
          <LeaderboardList entries={entries} currentUserId={profile?.id} />
        </>
      )}
    </div>
  );
}
