import type { MissionWithProgress } from '@features/missions/api/missions';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { cn } from '@lib/cn';

interface AchievementCardProps {
  mission: MissionWithProgress;
}

export function AchievementCard({ mission }: AchievementCardProps) {
  const pct = Math.min(100, (mission.progress / mission.target) * 100);
  const done = mission.completedAt !== null;

  return (
    <Card variant="surface-sm" className={cn('flex items-center gap-3 p-4', done && 'opacity-80')}>
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full',
          done ? 'bg-em' : 'bg-gg',
        )}
      >
        <Icon
          name={done ? 'verified' : 'emoji_events'}
          filled
          className="!text-[22px] text-white"
        />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">{mission.name}</div>
        <div className="text-[11px] text-on-3">{mission.description}</div>
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar
            value={pct}
            size="xs"
            fillClassName={done ? 'bg-em' : 'bg-gg'}
            className="flex-1"
          />
          <span className="text-[10px] text-on-3">
            {mission.progress}/{mission.target}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-bold text-gd">+{mission.rewardXP}</div>
        <div className="text-[9px] text-on-3">XP</div>
      </div>
    </Card>
  );
}
