import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { FIR_STEPS } from '@content/firSteps';
import { ROUTES } from '@config/routes';
import { useProfile } from '@shared/hooks/useProfile';
import { advanceFIR } from '../api/advanceFIR';
import { useToast } from '@shared/hooks/useToast';
import { isStepDone, countDone } from '@lib/bitmask';
import { cn } from '@lib/cn';

export function FIRPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const mask = profile?.firDoneMask ?? 0;
  const doneCount = countDone(mask);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const handleToggle = async (stepId: number, rewardXP: number, title: string) => {
    // FIR usa 1-indexed; mask é 0-indexed
    if (isStepDone(mask, stepId - 1)) return;
    setSubmittingId(stepId);
    try {
      await advanceFIR(stepId, rewardXP, title);
      qc.invalidateQueries({ queryKey: ['profile'] });
      if (doneCount + 1 >= 8) {
        toast('FIR concluído! Bora pro dashboard', 'success', 'celebration');
        setTimeout(() => nav(ROUTES.DASHBOARD), 600);
      } else {
        toast(`+${rewardXP} XP · ${title}`, 'xp', 'star');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao avançar', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="mx-auto min-h-dvh max-w-page bg-sf-void px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="serif text-2xl font-bold">FIR — Primeiros Passos</h1>
          <p className="text-xs text-on-3">{doneCount} de 8 etapas concluídas</p>
        </div>
        <button
          onClick={() => nav(ROUTES.DASHBOARD)}
          className="tap text-xs text-on-3 hover:text-on"
        >
          Pular
        </button>
      </header>

      <div className="flex flex-col gap-2">
        {FIR_STEPS.map((s) => {
          const done = isStepDone(mask, s.id - 1);
          const busy = submittingId === s.id;
          return (
            <Card key={s.id} variant="surface-sm" className="flex items-center gap-3 p-3">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  done ? 'bg-em' : 'bg-sf-top',
                )}
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
              {!done && (
                <Button
                  size="sm"
                  variant="gp"
                  disabled={busy}
                  onClick={() => handleToggle(s.id, s.rewardXP, s.title)}
                >
                  {busy ? '...' : 'Feito'}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <Button variant="surface" fullWidth onClick={() => nav(ROUTES.DASHBOARD)}>
          Continuar depois
        </Button>
      </div>
    </div>
  );
}
