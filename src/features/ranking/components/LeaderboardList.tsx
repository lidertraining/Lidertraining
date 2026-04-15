import type { LeaderboardEntry } from '../api/leaderboard';
import { Avatar } from '@shared/ui/Avatar';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { formatXP } from '@lib/format';
import { cn } from '@lib/cn';

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  startAt?: number; // index inicial (padr\u00e3o 3, depois do p\u00f3dio)
}

export function LeaderboardList({ entries, currentUserId, startAt = 3 }: LeaderboardListProps) {
  const rest = entries.slice(startAt);
  if (rest.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {rest.map((e, i) => {
        const position = startAt + i + 1;
        const isMe = e.id === currentUserId;
        // Zonas: top 5 sobem (1-5), bottom 3 descem (n-2 ... n)
        const promote = position <= 5;
        const demote = position > entries.length - 3;

        return (
          <Card
            key={e.id}
            variant="surface-sm"
            className={cn(
              'flex items-center gap-3 p-3',
              isMe && 'shadow-glow-am ring-1 ring-am/40',
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sf-hi font-bold text-on-2">
              {position}
            </div>
            <Avatar name={e.name} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{isMe ? 'Voc\u00ea' : e.name}</div>
              <div className="text-[11px] text-on-3">{e.level}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-am">{formatXP(e.weeklyXP)}</div>
              <div className="text-[10px] text-on-3">XP semana</div>
            </div>
            {promote && (
              <Icon name="arrow_upward" filled className="!text-[16px] text-em" />
            )}
            {demote && (
              <Icon name="arrow_downward" filled className="!text-[16px] text-rb" />
            )}
          </Card>
        );
      })}
    </div>
  );
}
