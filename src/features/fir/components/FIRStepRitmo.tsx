import type { FIRDados } from '../firTypes';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { cn } from '@lib/cn';

interface Props {
  dados: FIRDados;
  setDados: (d: FIRDados) => void;
}

const BADGES = [
  { min: 3, max: 5, label: 'Iniciante', icon: 'spa', cor: 'text-cy' },
  { min: 6, max: 10, label: 'Consistente', icon: 'fitness_center', cor: 'text-am' },
  { min: 11, max: 14, label: 'Intenso', icon: 'bolt', cor: 'text-gd' },
  { min: 15, max: 21, label: 'Imparável', icon: 'whatshot', cor: 'text-or' },
];

function getBadge(days: number) {
  return BADGES.find((b) => days >= b.min && days <= b.max) ?? BADGES[0]!;
}

export function FIRStepRitmo({ dados, setDados }: Props) {
  const convDias = dados.convitesDias;
  const demoDias = dados.demonstracoesDias;

  const badge = getBadge(convDias);

  const convitesPerDay = convDias > 0 ? Math.ceil(21 / convDias) : 0;
  const demosPerDay = demoDias > 0 ? Math.ceil(7 / demoDias) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="serif text-xl font-bold">Monte seu ritmo</h2>
        <p className="mt-1 text-sm text-on-2">
          Quantos dias por semana você vai dedicar a convites e demonstrações?
          Ajuste o slider — o app calcula o ritmo ideal.
        </p>
      </div>

      {/* Convites */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Icon name="mail" filled className="!text-[18px] text-am" />
          <div className="flex-1 text-sm font-semibold">Dias de convite por semana</div>
          <span className="serif text-lg font-bold text-am">{convDias}</span>
        </div>
        <input
          type="range"
          min={1}
          max={21}
          value={convDias}
          onChange={(e) => setDados({ ...dados, convitesDias: Number(e.target.value) })}
          className="h-1.5 w-full appearance-none rounded-full bg-sf-top accent-am"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-on-3">1 dia</span>
          <span className="text-[10px] text-on-3">21 dias</span>
        </div>

        <div className="flex items-center gap-2 rounded-card bg-am/10 px-3 py-2">
          <Icon name={badge.icon} filled className={`!text-[16px] ${badge.cor}`} />
          <span className={cn('text-[11px] font-bold', badge.cor)}>{badge.label}</span>
          <span className="text-[11px] text-on-3">
            · ~{convitesPerDay} convite(s)/dia pra meta de 21/sem
          </span>
        </div>
      </Card>

      {/* Demonstrações */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Icon name="co_present" filled className="!text-[18px] text-gd" />
          <div className="flex-1 text-sm font-semibold">Dias de demonstração por semana</div>
          <span className="serif text-lg font-bold text-gd">{demoDias}</span>
        </div>
        <input
          type="range"
          min={1}
          max={14}
          value={demoDias}
          onChange={(e) => setDados({ ...dados, demonstracoesDias: Number(e.target.value) })}
          className="h-1.5 w-full appearance-none rounded-full bg-sf-top accent-gd"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-on-3">1 dia</span>
          <span className="text-[10px] text-on-3">14 dias</span>
        </div>

        <div className="rounded-card bg-gd/10 px-3 py-2 text-[11px] text-on-2">
          ~{demosPerDay} demonstração(ões)/dia pra meta de 7/sem
        </div>
      </Card>
    </div>
  );
}
