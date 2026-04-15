import type { MissionWithProgress } from '@features/missions/api/missions';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { useMissionTimer } from '../hooks/useMissionTimer';
import { formatDuration } from '@lib/format';

interface FlashMissionCardProps {
  mission: MissionWithProgress;
}

export function FlashMissionCard({ mission }: FlashMissionCardProps) {
  const remaining = useMissionTimer(mission.expiresAt);
  const expired = mission.expiresAt !== null && remaining <= 0;
  const pct = Math.min(100, (mission.progress / mission.target) * 100);

  return (
    <Card variant="surface" className="flex flex-col gap-3 p-4" glow="am">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-or/20">
          <Icon name="bolt" filled className="!text-[20px] text-or" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-or">
            Flash
          </div>
          <div className="serif text-base font-bold">{mission.name}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-on-3">Recompensa</div>
          <div className="text-sm font-bold text-am">+{mission.rewardXP} XP</div>
        </div>
      </div>

      <p className="text-xs text-on-2">{mission.description}</p>

      <div className="flex items-center gap-2">
        <ProgressBar value={pct} size="sm" fillClassName="bg-or" className="flex-1" />
        <span className="text-[11px] font-semibold text-on-2">
          {mission.progress}/{mission.target}
        </span>
      </div>

      {mission.expiresAt && (
        <div className="flex items-center gap-1 text-[11px]">
          <Icon name="timer" className="!text-[14px] text-on-3" />
          <span className={expired ? 'text-rb' : 'text-on-2'}>
            {expired ? 'Expirou' : `Expira em ${formatDuration(remaining)}`}
          </span>
        </div>
      )}
    </Card>
  );
}
