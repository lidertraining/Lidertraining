import type { League } from '@types/domain';
import { LEAGUES } from '@content/leagues';
import { Icon } from '@shared/ui/Icon';
import { cn } from '@lib/cn';

interface LeagueSelectorProps {
  active: League;
  onChange: (l: League) => void;
}

export function LeagueSelector({ active, onChange }: LeagueSelectorProps) {
  return (
    <div className="no-scroll -mx-4 flex gap-2 overflow-x-auto px-4">
      {LEAGUES.map((l) => {
        const isActive = l.name === active;
        return (
          <button
            key={l.name}
            onClick={() => onChange(l.name as League)}
            className={cn(
              'tap flex shrink-0 items-center gap-2 rounded-chip px-4 py-2 text-xs font-semibold transition',
              isActive ? 'bg-gp text-white' : 'bg-sf-hi text-on-2',
            )}
          >
            <Icon name={l.icon} filled className={cn('!text-[16px]', isActive && 'text-white')} />
            {l.name}
          </button>
        );
      })}
    </div>
  );
}
