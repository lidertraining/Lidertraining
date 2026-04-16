import { Link } from 'react-router-dom';
import type { NBA } from '../hooks/useNBA';
import { Icon } from '@shared/ui/Icon';
import { cn } from '@lib/cn';

interface NBACardProps {
  nba: NBA | null;
}

const BG: Record<NBA['variant'], string> = {
  gp: 'bg-gp',
  gg: 'bg-gg',
  ge: 'bg-ge',
  gr: 'bg-gr',
};

export function NBACard({ nba }: NBACardProps) {
  if (!nba) return null;

  return (
    <Link to={nba.href} className="tap block animate-fade-up">
      <div
        className={cn(
          'relative overflow-hidden rounded-card p-5 text-white shadow-glow-am',
          BG[nba.variant],
        )}
      >
        <div className="relative z-10 flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <Icon name={nba.icon} filled className="!text-[22px] text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-white/70">
              Próxima melhor ação
            </div>
            <div className="serif text-lg font-bold">{nba.title}</div>
            <div className="mt-0.5 text-xs text-white/85">{nba.description}</div>
          </div>
          <Icon name="arrow_forward" className="mt-1 !text-[18px] text-white/80" />
        </div>
      </div>
    </Link>
  );
}
