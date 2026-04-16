import type { TeamLearningMember } from '../api/teamLearning';
import { StatCard } from '@shared/ui/StatCard';

interface TeamLearningStatsProps {
  members: TeamLearningMember[];
}

/**
 * Stats agregadas focadas em aprendizado.
 * Média de jornada, FIR completos, áudios médios, ativos esta semana.
 */
export function TeamLearningStats({ members }: TeamLearningStatsProps) {
  const direct = members.filter((m) => m.depth === 1);
  const total = direct.length;

  if (total === 0) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon="group" label="Equipe direta" value={0} />
        <StatCard icon="school" label="Aprendizado" value="—" />
      </div>
    );
  }

  const activeWeek = direct.filter((m) => m.daysSinceActive <= 7).length;
  const firComplete = direct.filter((m) => m.firCompleted).length;
  const avgJourney = Math.round(
    (direct.reduce((sum, m) => sum + m.journeyStep, 0) / total) * 10,
  ); // em porcentagem (0-100)
  const audiosTotal = direct[0]?.audiosTotal ?? 0;
  const avgAudios =
    audiosTotal > 0
      ? Math.round(
          (direct.reduce((sum, m) => sum + m.audiosDone, 0) / (total * audiosTotal)) * 100,
        )
      : 0;

  return (
    <div className="grid grid-cols-2 gap-2">
      <StatCard
        icon="group"
        label="Equipe direta"
        value={total}
        trend={`${activeWeek} ativos semana`}
        trendPositive={activeWeek > total / 2}
      />
      <StatCard
        icon="verified"
        label="FIR completo"
        value={`${firComplete}/${total}`}
      />
      <StatCard icon="route" label="Jornada média" value={`${avgJourney}%`} />
      <StatCard icon="headphones" label="Áudios médio" value={`${avgAudios}%`} />
    </div>
  );
}
