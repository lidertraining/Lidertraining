import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { useProfile } from '@shared/hooks/useProfile';

export function VIP600Card() {
  const { data: profile } = useProfile();
  const vip = profile?.vip ?? 0;
  const pct = Math.min(100, (vip / 600) * 100);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="serif text-lg font-bold">VIP 600</h2>
      <Card variant="surface" className="flex flex-col gap-3 p-5" glow="am">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gp">
            <Icon name="diamond" filled className="!text-[22px] text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
              Meta mensal
            </div>
            <div className="serif text-base font-bold">Consultor VIP</div>
          </div>
          <div className="text-right">
            <div className="serif text-2xl font-bold text-am">{vip}</div>
            <div className="text-[10px] text-on-3">de 600</div>
          </div>
        </div>
        <ProgressBar value={pct} fillClassName="bg-gp" />
        <p className="text-[11px] text-on-3">
          Mantenha o ritmo consumindo e compartilhando produtos todo mês.
        </p>
      </Card>
    </section>
  );
}
