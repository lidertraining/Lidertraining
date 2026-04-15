import type { Profile } from '@types/domain';
import { Card } from '@shared/ui/Card';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { Icon } from '@shared/ui/Icon';
import { formatBRL } from '@lib/format';

interface CommissionSimulatorProps {
  profile: Profile;
}

export function CommissionSimulator({ profile }: CommissionSimulatorProps) {
  const current = Number(profile.commCurrent) || 0;
  const projected = Number(profile.commProjected) || 0;
  const goal = Number(profile.commGoal) || 0;
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;

  return (
    <Card variant="surface" className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2 text-on-3">
        <Icon name="payments" className="!text-[16px]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          Comiss\u00e3o do m\u00eas
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] text-on-3">Atual</div>
          <div className="serif text-3xl font-bold">{formatBRL(current)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-on-3">Meta</div>
          <div className="text-sm font-semibold text-on-2">{formatBRL(goal)}</div>
        </div>
      </div>

      <ProgressBar value={pct} fillClassName="bg-gg" />

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-on-3">Projetada p/ fim do m\u00eas</span>
        <span className="font-semibold text-em">{formatBRL(projected)}</span>
      </div>
    </Card>
  );
}
