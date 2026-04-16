import { Link } from 'react-router-dom';
import type { NBA } from '../hooks/useNBA';
import { Icon } from '@shared/ui/Icon';
import { cn } from '@lib/cn';

interface NBACardProps {
  nba: NBA[];
}

const BG: Record<NBA['variant'], string> = {
  gp: 'bg-gp',
  gg: 'bg-gg',
  ge: 'bg-ge',
  gr: 'bg-gr',
};

export function NBACard({ nba }: NBACardProps) {
  if (nba.length === 0) return null;

  const primary = nba[0]!;
  const secondary = nba.slice(1);

  return (
    <div className="flex flex-col gap-2 animate-fade-up">
      {/* Ação principal */}
      <Link to={primary.href} className="tap block">
        <div
          className={cn(
            'relative overflow-hidden rounded-card p-5 text-white shadow-glow-am',
            BG[primary.variant],
          )}
        >
          <div className="relative z-10 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
              <Icon name={primary.icon} filled className="!text-[22px] text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                Próxima melhor ação
              </div>
              <div className="serif text-lg font-bold">{primary.title}</div>
              <div className="mt-0.5 text-xs text-white/85">{primary.description}</div>
              {primary.xpReward && (
                <div className="mt-1 inline-flex items-center gap-1 rounded-chip bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                  <Icon name="star" filled className="!text-[10px]" />
                  +{primary.xpReward} XP
                </div>
              )}
            </div>
            <Icon name="arrow_forward" className="mt-1 !text-[18px] text-white/80" />
          </div>
        </div>
      </Link>

      {/* Ações secundárias */}
      {secondary.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {secondary.map((action, i) => (
            <Link key={i} to={action.href} className="tap block">
              <div
                className={cn(
                  'flex items-center gap-2 rounded-card-sm p-3 text-white',
                  BG[action.variant],
                )}
              >
                <Icon name={action.icon} filled className="!text-[18px] text-white/90" />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-[11px] font-semibold">{action.title}</div>
                  {action.xpReward && (
                    <div className="text-[9px] text-white/70">+{action.xpReward} XP</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
