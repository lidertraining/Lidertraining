import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { FIR_STEPS } from '@content/firSteps';
import { ROUTES } from '@config/routes';
import { useProfile } from '@shared/hooks/useProfile';

export function FIRPage() {
  const nav = useNavigate();
  const { data: profile } = useProfile();
  const current = profile?.firStep ?? 0;

  return (
    <div className="mx-auto min-h-dvh max-w-page bg-sf-void px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="serif text-2xl font-bold">FIR \u2014 Primeiros Passos</h1>
        <button
          onClick={() => nav(ROUTES.DASHBOARD)}
          className="tap text-xs text-on-3 hover:text-on"
        >
          Pular
        </button>
      </header>

      <div className="flex flex-col gap-2">
        {FIR_STEPS.map((s) => {
          const done = s.id <= current;
          const isNext = s.id === current + 1;
          return (
            <Card
              key={s.id}
              variant="surface-sm"
              className="flex items-center gap-3 p-3"
            >
              <div
                className={
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full ' +
                  (done ? 'bg-em' : isNext ? 'bg-gp' : 'bg-sf-top')
                }
              >
                {done ? (
                  <Icon name="check" filled className="!text-[18px] text-white" />
                ) : (
                  <span className="text-xs font-bold">{s.id}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{s.title}</div>
                <div className="text-[11px] text-on-3">+{s.rewardXP} XP</div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="surface" fullWidth onClick={() => nav(ROUTES.DASHBOARD)}>
          Continuar depois
        </Button>
      </div>
    </div>
  );
}
