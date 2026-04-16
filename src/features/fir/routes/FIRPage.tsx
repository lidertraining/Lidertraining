import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Markdown } from '@shared/ui/Markdown';
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
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleToggle = async (stepId: number, rewardXP: number, title: string) => {
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
          <p className="text-xs text-on-3">
            {doneCount} de 8 etapas · toque no card para abrir a lição
          </p>
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
          const expanded = expandedId === s.id;
          const hasBody = !!(s.body || s.checklist?.length);

          return (
            <Card key={s.id} variant="surface-sm" className="flex flex-col gap-3 p-3">
              <button
                type="button"
                onClick={() => (hasBody ? setExpandedId(expanded ? null : s.id) : undefined)}
                className="flex items-center gap-3 text-left"
              >
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(s.id, s.rewardXP, s.title);
                    }}
                  >
                    {busy ? '...' : 'Feito'}
                  </Button>
                )}
                {hasBody && (
                  <Icon
                    name={expanded ? 'expand_less' : 'expand_more'}
                    className="!text-[18px] text-on-3"
                  />
                )}
              </button>

              {/* Corpo da lição (expansível) */}
              {expanded && hasBody && (
                <div className="flex flex-col gap-3 border-t border-sf-top/40 pt-3">
                  {s.body && <Markdown source={s.body} />}

                  {s.checklist && s.checklist.length > 0 && (
                    <div className="rounded-card bg-sf-top/40 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Icon name="checklist" filled className="!text-[16px] text-em" />
                        <div className="text-sm font-semibold">Checklist</div>
                      </div>
                      <ul className="flex flex-col gap-1.5">
                        {s.checklist.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-[12px] text-on-2">
                            <Icon
                              name="radio_button_unchecked"
                              className="!text-[14px] text-on-3"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {s.tip && (
                    <div className="rounded-card border-l-2 border-gd bg-gd/10 p-3 text-[12px] italic text-on-2">
                      <span className="font-semibold text-gd">Dica: </span>
                      {s.tip}
                    </div>
                  )}
                </div>
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
