import { Link } from 'react-router-dom';
import { useProfile } from '@shared/hooks/useProfile';
import { useJourneySteps } from '../hooks/useJourneyContent';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { buildRoute } from '@config/routes';
import { isStepDone, countDone } from '@lib/bitmask';
import { cn } from '@lib/cn';

export function JourneyListPage() {
  const { data: profile } = useProfile();
  const { data: steps = [] } = useJourneySteps();
  const mask = profile?.journeyDoneMask ?? 0;
  const current = profile?.journeyStep ?? 0;

  const completed = countDone(mask);
  const total = steps.length;
  const progressPct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-5 pt-2">
      <header className="animate-fade-up">
        <div className="text-sm text-on-3">Trilha completa</div>
        <h1 className="serif text-3xl font-bold">Sua Jornada</h1>
        <p className="mt-1 text-[11px] text-on-3">Faça os passos na ordem que preferir.</p>
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
          const done = isStepDone(mask, step.id);
          const isCurrent = !done && step.id === current;

          return (
            <Link
              key={step.id}
              to={buildRoute.journeyStep(step.id)}
              className="tap block"
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
                      <span className="xp-badge !px-2 !py-0.5 text-[9px]">SUGERIDO</span>
                    )}
                    {done && (
                      <span className="rounded-chip bg-em/20 px-2 py-0.5 text-[9px] font-semibold text-em">
                        FEITO
                      </span>
                    )}
                  </div>
                  <div className="serif text-base font-bold">{step.name}</div>
                  <div className="text-[11px] text-on-3">{step.description}</div>
                </div>
                <Icon name="chevron_right" className="!text-[18px] text-on-3" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
