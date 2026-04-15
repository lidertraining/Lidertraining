import { useState } from 'react';
import { useObjections } from '../hooks/useJourneyContent';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { cn } from '@lib/cn';

export function ObjectionsPanel() {
  const { data: items = [] } = useObjections();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="serif text-base font-bold">Objeções comuns</h3>
      <p className="text-xs text-on-3">Toque para ver a resposta sugerida.</p>
      {items.map((o, i) => {
        const open = openIdx === i;
        return (
          <Card
            key={i}
            variant="surface-sm"
            className="overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : i)}
              className="tap flex w-full items-center gap-3 p-4 text-left"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rb/15">
                <Icon name="question_mark" className="!text-[16px] text-rb" />
              </div>
              <div className="flex-1 text-sm font-semibold">{o.objection}</div>
              <Icon
                name="expand_more"
                className={cn('!text-[18px] transition-transform', open && 'rotate-180')}
              />
            </button>
            {open && (
              <div className="border-t border-sf-top/60 bg-sf-low p-4 text-sm text-on-2 animate-fade-in">
                {o.response}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
