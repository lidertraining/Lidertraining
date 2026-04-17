import { useState } from 'react';
import { useObjections } from '../hooks/useJourneyContent';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { useAddXP } from '@features/gamification/hooks/useAddXP';
import { useToast } from '@shared/hooks/useToast';
import { cn } from '@lib/cn';

export function ObjectionsPanel() {
  const { data: items = [] } = useObjections();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [practiced, setPracticed] = useState<Set<number>>(new Set());
  const { mutate: addXP } = useAddXP();
  const { toast } = useToast();

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast('Resposta copiada', 'success', 'content_copy');
    } catch {
      toast('Erro ao copiar', 'error');
    }
  };

  const markPracticed = (i: number) => {
    if (practiced.has(i)) return;
    setPracticed((prev) => new Set(prev).add(i));
    addXP({ amount: 10, reason: `Objeção praticada: ${items[i]?.objection}` });
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="serif text-base font-bold">Objeções comuns</h3>
      <p className="text-xs text-on-3">Toque para ver a resposta. Pratique e ganhe XP.</p>
      {items.map((o, i) => {
        const open = openIdx === i;
        const done = practiced.has(i);
        return (
          <Card key={i} variant="surface-sm" className="overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : i)}
              className="tap flex w-full items-center gap-3 p-4 text-left"
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  done ? 'bg-em/20' : 'bg-rb/15',
                )}
              >
                <Icon
                  name={done ? 'check' : 'question_mark'}
                  filled={done}
                  className={cn('!text-[16px]', done ? 'text-em' : 'text-rb')}
                />
              </div>
              <div className="flex-1 text-sm font-semibold">{o.objection}</div>
              <Icon
                name="expand_more"
                className={cn('!text-[18px] transition-transform', open && 'rotate-180')}
              />
            </button>
            {open && (
              <div className="flex flex-col gap-3 border-t border-sf-top/60 bg-sf-low p-4 animate-fade-in">
                <div className="rounded-card bg-em/5 p-3">
                  <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-em">
                    Resposta sugerida
                  </div>
                  <p className="text-sm text-on-2">{o.response}</p>
                </div>

                {o.context && (
                  <p className="text-[10px] text-on-3">
                    <span className="font-semibold">Quando aparece: </span>
                    {o.context}
                  </p>
                )}

                {o.followUp && (
                  <p className="text-[10px] text-am">
                    <span className="font-semibold">Devolva: </span>
                    "{o.followUp}"
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="surface"
                    className="flex-1"
                    onClick={() => copy(o.response)}
                    leftIcon={<Icon name="content_copy" className="!text-[12px]" />}
                  >
                    Copiar
                  </Button>
                  <Button
                    size="sm"
                    variant={done ? 'surface' : 'gp'}
                    className="flex-1"
                    disabled={done}
                    onClick={() => markPracticed(i)}
                    leftIcon={
                      <Icon
                        name={done ? 'check_circle' : 'sports_esports'}
                        filled
                        className="!text-[12px]"
                      />
                    }
                  >
                    {done ? 'Praticado' : 'Pratiquei · +10 XP'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
