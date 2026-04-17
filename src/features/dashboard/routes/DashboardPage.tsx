import { useProfile } from '@shared/hooks/useProfile';
import { useDailyTick } from '@features/gamification/hooks/useDailyTick';
import { useStreakMilestones } from '@features/gamification/hooks/useStreakMilestones';
import { HeroGreeting } from '../components/HeroGreeting';
import { NBACard } from '../components/NBACard';
import { TodayCard } from '../components/TodayCard';
import { StatsGrid } from '../components/StatsGrid';
import { CommissionSimulator } from '../components/CommissionSimulator';
import { PersonalGoalCard } from '../components/PersonalGoalCard';
import { FlashMissionsPreview } from '../components/FlashMissionsPreview';
import { QuickActions } from '../components/QuickActions';
import { XPBar } from '@features/gamification/components/XPBar';
import { FeedList } from '@features/feed/components/FeedList';
import { useNBA } from '../hooks/useNBA';

export function DashboardPage() {
  useDailyTick();
  useStreakMilestones();
  const { data: profile, isLoading } = useProfile();
  const nba = useNBA(profile);

  if (isLoading || !profile) {
    return <div className="pt-8 text-center text-sm text-on-3">Carregando…</div>;
  }

  return (
    <div className="flex flex-col gap-5 pt-2">
      <HeroGreeting name={profile.name} />

      <NBACard nba={nba} />

      <TodayCard profile={profile} />

      <XPBar xp={profile.xp} />

      <StatsGrid profile={profile} />

      <PersonalGoalCard profile={profile} />

      <CommissionSimulator profile={profile} />

      <QuickActions />

      <FlashMissionsPreview />

      <section className="flex flex-col gap-3">
        <h2 className="serif text-lg font-bold">Atividade da equipe</h2>
        <FeedList limit={8} />
      </section>
    </div>
  );
}
