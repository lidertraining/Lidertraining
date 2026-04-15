import { Card } from '@shared/ui/Card';
import { ONE_ON_ONE_PLAN } from '@content/oneOnOnePlan';

export function OneOnOneCard() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="serif text-lg font-bold">Plano 1x1</h2>
      <Card variant="surface" className="flex flex-col gap-0 p-5">
        {ONE_ON_ONE_PLAN.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-sf-top/40 py-2 last:border-0"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-am-darker/30">
              <span className="text-xs font-bold text-am">{i + 1}</span>
            </div>
            <div className="flex-1 text-sm text-on">{s}</div>
          </div>
        ))}
      </Card>
    </section>
  );
}
