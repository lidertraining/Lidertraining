import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { useProfile } from '@shared/hooks/useProfile';
import { cn } from '@lib/cn';

interface Chain {
  days: number;
  name: string;
  icon: string;
  description: string;
  rewardXP: number;
  color: string;
  fillClass: string;
}

const CHAINS: Chain[] = [
  {
    days: 7,
    name: 'Desafio 7 Dias',
    icon: 'bolt',
    description: 'Mantenha 7 dias de streak seguidos. Construa o hábito.',
    rewardXP: 120,
    color: 'or',
    fillClass: 'bg-or',
  },
  {
    days: 14,
    name: 'Desafio 14 Dias',
    icon: 'local_fire_department',
    description: 'Duas semanas sem falhar. Consistência vira identidade.',
    rewardXP: 190,
    color: 'rb',
    fillClass: 'bg-rb',
  },
  {
    days: 21,
    name: 'Desafio 21 Dias',
    icon: 'whatshot',
    description: 'Hábito formado. Depois de 21 dias, é parte de você.',
    rewardXP: 260,
    color: 'am',
    fillClass: 'bg-am',
  },
];

export function ChallengeChains() {
  const { data: profile } = useProfile();
  const streak = profile?.streak ?? 0;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="serif text-lg font-bold">Desafios de streak</h2>
      <div className="flex flex-col gap-2">
        {CHAINS.map((chain) => {
          const progress = Math.min(streak, chain.days);
          const pct = (progress / chain.days) * 100;
          const done = streak >= chain.days;

          return (
            <Card
              key={chain.days}
              variant="surface-sm"
              className={cn('flex flex-col gap-3 p-4', done && 'ring-1 ring-em/40')}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    done ? 'bg-em' : `bg-${chain.color}/20`,
                  )}
                >
                  <Icon
                    name={done ? 'verified' : chain.icon}
                    filled
                    className={cn(
                      '!text-[20px]',
                      done ? 'text-white' : `text-${chain.color}`,
                    )}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{chain.name}</div>
                  <div className="text-[11px] text-on-3">{chain.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-on-3">Recompensa</div>
                  <div className={cn('text-sm font-bold', done ? 'text-em' : `text-${chain.color}`)}>
                    +{chain.rewardXP} XP
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ProgressBar
                  value={pct}
                  size="sm"
                  fillClassName={done ? 'bg-em' : chain.fillClass}
                  className="flex-1"
                />
                <span className="text-[10px] font-semibold text-on-3">
                  {progress}/{chain.days}d
                </span>
              </div>
              {done && (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-em">
                  <Icon name="check_circle" filled className="!text-[14px]" />
                  Desafio completo!
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
