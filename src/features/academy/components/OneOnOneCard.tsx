import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ONE_ON_ONE_DETAIL } from '@content/oneOnOnePlan';

export function OneOnOneCard() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="serif text-lg font-bold">Plano 1x1 semanal</h2>
      <p className="text-[11px] text-on-3">
        Roteiro da conversa upline ↔ líder. 45 minutos, mesmo fluxo toda semana.
      </p>
      <Card variant="surface" className="flex flex-col gap-0 p-5">
        {ONE_ON_ONE_DETAIL.map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-3 border-b border-sf-top/40 py-3 last:border-0"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-am-darker/30">
              <span className="text-xs font-bold text-am">{i + 1}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-on">{s.step}</div>
                {s.duration && (
                  <span className="flex items-center gap-1 rounded-chip bg-sf-top px-2 py-0.5 text-[9px] font-semibold text-on-3">
                    <Icon name="schedule" className="!text-[10px]" />
                    {s.duration}
                  </span>
                )}
              </div>
              {s.detail && <p className="mt-1 text-[11px] text-on-3">{s.detail}</p>}
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}
