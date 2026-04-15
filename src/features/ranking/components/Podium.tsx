import type { LeaderboardEntry } from '../api/leaderboard';
import { Avatar } from '@shared/ui/Avatar';
import { formatXP } from '@lib/format';
import { cn } from '@lib/cn';

interface PodiumProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const PLACES = [
  { idx: 1, h: 'h-24', bg: 'bg-on-3', label: '2\u00ba', emoji: '\u{1F948}' }, // 2nd
  { idx: 0, h: 'h-32', bg: 'bg-gg', label: '1\u00ba', emoji: '\u{1F947}' }, // 1st
  { idx: 2, h: 'h-20', bg: 'bg-or', label: '3\u00ba', emoji: '\u{1F949}' }, // 3rd
];

export function Podium({ entries, currentUserId }: PodiumProps) {
  if (entries.length === 0) return null;

  return (
    <div className="flex items-end justify-center gap-3">
      {PLACES.map((p) => {
        const entry = entries[p.idx];
        if (!entry) {
          return (
            <div key={p.idx} className="flex flex-1 flex-col items-center gap-2 opacity-30">
              <Avatar name="?" size="md" />
              <div className={cn('w-full rounded-t-card-sm bg-sf-top', p.h)} />
            </div>
          );
        }
        const isMe = entry.id === currentUserId;
        return (
          <div key={p.idx} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative">
              <Avatar name={entry.name} size={p.idx === 0 ? 'lg' : 'md'} />
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xl">
                {p.emoji}
              </span>
            </div>
            <div className="max-w-full truncate text-center text-[11px] font-semibold">
              {isMe ? 'Voc\u00ea' : entry.name}
            </div>
            <div className="text-[10px] text-am">{formatXP(entry.weeklyXP)} XP</div>
            <div
              className={cn(
                'flex w-full items-center justify-center rounded-t-card-sm text-white',
                p.bg,
                p.h,
              )}
            >
              <span className="serif text-xl font-bold">{p.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
