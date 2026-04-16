import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';

const BUCKETS = [
  { label: 'Reinvestir no negócio', pct: 50, color: 'bg-gp', icon: 'rocket_launch' },
  { label: 'Despesas pessoais', pct: 42.5, color: 'bg-ge', icon: 'home' },
  { label: 'Reserva de emergência', pct: 7.5, color: 'bg-gg', icon: 'savings' },
];

export function FinancialEdu() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="serif text-lg font-bold">Educação financeira</h2>
      <Card variant="surface" className="flex flex-col gap-3 p-5">
        <p className="text-xs text-on-3">
          Como distribuir cada real que você ganha no início da carreira.
        </p>
        <div className="flex h-3 overflow-hidden rounded-chip">
          {BUCKETS.map((b) => (
            <div key={b.label} className={b.color} style={{ width: `${b.pct}%` }} />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {BUCKETS.map((b) => (
            <div key={b.label} className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${b.color}`}
              >
                <Icon name={b.icon} filled className="!text-[16px] text-white" />
              </div>
              <div className="flex-1 text-sm">{b.label}</div>
              <div className="serif text-base font-bold">{b.pct}%</div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
