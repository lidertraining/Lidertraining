import type { DownlineMember } from '../api/downline';
import { StatCard } from '@shared/ui/StatCard';

interface TeamStatsProps {
  members: DownlineMember[];
}

export function TeamStats({ members }: TeamStatsProps) {
  const total = members.length;
  const active = members.filter((m) => m.streak > 0).length;
  const atRisk = members.filter((m) => m.streak === 0 && m.xp > 0).length;

  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCard icon="group" label="Equipe" value={total} />
      <StatCard icon="bolt" label="Ativos" value={active} trend="esta semana" trendPositive />
      <StatCard icon="warning" label="Em risco" value={atRisk} />
    </div>
  );
}
