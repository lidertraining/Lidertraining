import { Link } from 'react-router-dom';
import { useProfile } from '@shared/hooks/useProfile';
import { useJourneySteps } from '../hooks/useJourneyContent';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { buildRoute } from '@config/routes';
import { cn } from '@lib/cn';

export function JourneyListPage() {
  const { data: profile } = useProfile();
  const { data: steps = [] } = useJourneySteps();
  const current = profile?.journeyStep ?? 0;

  const completed = steps.filter((s) => s.id < current).length;
  const total = steps.length;
  const progressPct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-5 pt-2">
      <header className="animate-fade-up">
        <div className="text-sm text-on-3">Trilha completa</div>
        <h1 className="serif text-3xl font-bold">Sua Jornada</h1>
      </header>

      <Card variant="surface" className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-on-3">Progresso</span>
          <span className="font-semibold text-am">
            {completed} de {total} passos
          </span>
        </div>
        <ProgressBar value={progressPct} fillClassName="bg-gp" />
      </Card>

      <div className="flex flex-col gap-2">
        {steps.map((step) => {
          const done = step.id < current;
          const isCurrent = step.id === current;
          const locked = step.id > current;

          return (
            <Link
              key={step.id}
              to={locked ? '#' : buildRoute.journeyStep(step.id)}
              aria-disabled={locked}
              onClick={(e) => {
                if (locked) e.preventDefault();
              }}
              className={cn('tap block', locked && 'cursor-not-allowed opacity-50')}
            >
              <Card
                variant="surface-sm"
                className={cn(
                  'flex items-center gap-3 p-4',
                  isCurrent && 'shadow-glow-am ring-1 ring-am/40',
                )}
              >
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                    done ? 'bg-em' : isCurrent ? 'bg-gp' : 'bg-sf-top',
                  )}
                >
                  {done ? (
                    <Icon name="check" filled className="!text-[20px] text-white" />
                  ) : locked ? (
                    <Icon name="lock" className="!text-[18px] text-on-3" />
                  ) : (
                    <Icon name={step.icon} filled className="!text-[22px] text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
                      Passo {step.id + 1}
                    </span>
                    {isCurrent && (
                      <span className="xp-badge !px-2 !py-0.5 text-[9px]">ATUAL</span>
                    )}
                  </div>
                  <div className="serif text-base font-bold">{step.name}</div>
                  <div className="text-[11px] text-on-3">{step.description}</div>
                </div>
                {!locked && <Icon name="chevron_right" className="!text-[18px] text-on-3" />}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
