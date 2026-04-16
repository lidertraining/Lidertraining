import { useMemo } from 'react';
import { Icon } from '@shared/ui/Icon';
import { Card } from '@shared/ui/Card';
import { BADGES, type BadgeContext } from '@content/badges';
import { cn } from '@lib/cn';

interface BadgeGridProps {
  context: BadgeContext;
}

const COLOR_MAP: Record<string, string> = {
  em: 'bg-em text-white',
  or: 'bg-or text-white',
  rb: 'bg-rb text-white',
  gp: 'bg-gp text-white',
  am: 'bg-am text-sf-void',
  gd: 'bg-gg text-sf-void',
  cy: 'bg-cy text-sf-void',
};

export function BadgeGrid({ context }: BadgeGridProps) {
  const results = useMemo(
    () =>
      BADGES.map((b) => ({
        ...b,
        unlocked: b.check(context),
      })),
    [context],
  );

  const unlocked = results.filter((r) => r.unlocked).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-on-3">Desbloqueadas</span>
        <span className="font-semibold text-am">
          {unlocked}/{BADGES.length}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {results.map((badge) => (
          <Card
            key={badge.id}
            variant="surface-sm"
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 text-center',
              !badge.unlocked && 'opacity-30 grayscale',
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                badge.unlocked ? COLOR_MAP[badge.color] ?? 'bg-sf-top text-on-3' : 'bg-sf-top text-on-3',
              )}
            >
              <Icon
                name={badge.unlocked ? badge.icon : 'lock'}
                filled
                className="!text-[20px]"
              />
            </div>
            <div className="text-[10px] font-semibold leading-tight">
              {badge.name}
            </div>
            <div className="text-[8px] text-on-3 leading-tight">
              {badge.description}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
