import { useMissions } from '@features/missions/hooks/useMissions';
import { FlashMissionCard } from '../components/FlashMissionCard';
import { AchievementCard } from '../components/AchievementCard';
import { Start48hPanel } from '../components/Start48hPanel';
import { TwentyOneDaysGrid } from '../components/TwentyOneDaysGrid';
import { EmptyState } from '@shared/ui/EmptyState';

export function ArenaPage() {
  const { data: missions = [], isLoading } = useMissions();

  const flash = missions.filter((m) => m.type === 'flash');
  const weekly = missions.filter((m) => m.type === 'weekly');
  const achievements = missions.filter((m) => m.type === 'achievement');

  return (
    <div className="flex flex-col gap-6 pt-2">
      <header className="animate-fade-up">
        <div className="text-sm text-on-3">Miss\u00f5es e conquistas</div>
        <h1 className="serif text-3xl font-bold">Arena</h1>
      </header>

      <Start48hPanel />

      {isLoading ? (
        <div className="py-6 text-center text-xs text-on-3">Carregando miss\u00f5es\u2026</div>
      ) : (
        <>
          {flash.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="serif text-lg font-bold">Miss\u00f5es flash</h2>
              {flash.map((m) => (
                <FlashMissionCard key={m.id} mission={m} />
              ))}
            </section>
          )}

          {weekly.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="serif text-lg font-bold">Semanais</h2>
              {weekly.map((m) => (
                <AchievementCard key={m.id} mission={m} />
              ))}
            </section>
          )}

          {achievements.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="serif text-lg font-bold">Conquistas</h2>
              {achievements.map((m) => (
                <AchievementCard key={m.id} mission={m} />
              ))}
            </section>
          )}

          {missions.length === 0 && (
            <EmptyState
              icon="stadium"
              title="Nenhuma miss\u00e3o ativa"
              description="Novas miss\u00f5es aparecem semanalmente."
            />
          )}
        </>
      )}

      <TwentyOneDaysGrid />
    </div>
  );
}
