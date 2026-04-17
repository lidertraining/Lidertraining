import { Link } from 'react-router-dom';
import { useProfile } from '@shared/hooks/useProfile';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { buildRoute } from '@config/routes';
import { PASSOS_V2, ARQUETIPO_CORES } from '../jornada-v2-types';
import { isStepDone, countDone } from '@lib/bitmask';
import { cn } from '@lib/cn';

export function JourneyListPage() {
  const { data: profile } = useProfile();
  const mask = profile?.journeyDoneMask ?? 0;
  const current = profile?.journeyStep ?? 0;

  const completed = countDone(mask);
  const total = PASSOS_V2.length;
  const progressPct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-5 pt-2">
      <header className="animate-fade-up">
        <div className="text-sm text-on-3">Trilha completa</div>
        <h1 className="serif text-3xl font-bold">Sua Jornada</h1>
        <p className="mt-1 text-[11px] text-on-3">
          11 passos · 5 experiências diferentes · faça na ordem que preferir.
        </p>
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
        {PASSOS_V2.map((passo) => {
          const done = isStepDone(mask, passo.id);
          const isCurrent = !done && passo.id === current;
          const cores = ARQUETIPO_CORES[passo.arquetipo];

          return (
            <Link
              key={passo.id}
              to={buildRoute.journeyStep(passo.id)}
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
                    done ? 'bg-em' : cores.bg,
                  )}
                >
                  {done ? (
                    <Icon name="check" filled className="!text-[20px] text-white" />
                  ) : (
                    <Icon name={passo.icon} filled className={cn('!text-[22px]', cores.text)} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
                      Passo {passo.id + 1}
                    </span>
                    <span className={cn('rounded-chip px-1.5 py-0.5 text-[8px] font-bold', cores.bg, cores.text)}>
                      {cores.badge}
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
                  <div className="serif text-base font-bold">{passo.nome}</div>
                  <div className="text-[11px] text-on-3">{passo.descricao}</div>
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
