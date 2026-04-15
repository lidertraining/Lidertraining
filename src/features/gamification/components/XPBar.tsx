import { getCareerProgress } from '@content/career';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { formatXP } from '@lib/format';
import { Icon } from '@shared/ui/Icon';

interface XPBarProps {
  xp: number;
}

export function XPBar({ xp }: XPBarProps) {
  const { current, next, progress } = getCareerProgress(xp);

  return (
    <div className="surface flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name={current.icon} filled className={`text-${current.color}`} />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
              N\u00edvel atual
            </div>
            <div className="serif text-lg font-bold">{current.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-on-3">
            {formatXP(xp)} XP{next && ` / ${formatXP(next.xp)}`}
          </div>
          {next && <div className="text-[10px] text-am">{next.name} \u2192</div>}
        </div>
      </div>
      <ProgressBar value={progress} fillClassName="bg-gp" />
    </div>
  );
}
