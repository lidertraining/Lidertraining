import { Card } from '@shared/ui/Card';
import { cn } from '@lib/cn';

interface PipelineBarProps {
  frio: number;
  morno: number;
  quente: number;
  fechado: number;
}

const STAGES = [
  { key: 'frio' as const, label: 'Frio', color: 'bg-sp', textColor: 'text-sp' },
  { key: 'morno' as const, label: 'Morno', color: 'bg-gd', textColor: 'text-gd' },
  { key: 'quente' as const, label: 'Quente', color: 'bg-or', textColor: 'text-or' },
  { key: 'fechado' as const, label: 'Fechado', color: 'bg-em', textColor: 'text-em' },
];

export function PipelineBar({ frio, morno, quente, fechado }: PipelineBarProps) {
  const counts = { frio, morno, quente, fechado };
  const total = frio + morno + quente + fechado;

  if (total === 0) return null;

  return (
    <Card variant="surface-sm" className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-semibold uppercase tracking-wider text-on-3">Funil de conversão</span>
        <span className="text-on-3">{total} leads</span>
      </div>

      {/* Barra de funil */}
      <div className="flex h-4 overflow-hidden rounded-chip">
        {STAGES.map((stage) => {
          const count = counts[stage.key];
          const pct = total > 0 ? (count / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={stage.key}
              className={cn('flex items-center justify-center text-[8px] font-bold text-white transition-all', stage.color)}
              style={{ width: `${pct}%` }}
              title={`${stage.label}: ${count}`}
            >
              {pct > 10 && count}
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between">
        {STAGES.map((stage) => (
          <div key={stage.key} className="flex flex-col items-center">
            <span className={cn('text-base font-bold', stage.textColor)}>
              {counts[stage.key]}
            </span>
            <span className="text-[9px] text-on-3">{stage.label}</span>
          </div>
        ))}
      </div>

      {/* Taxa de conversão */}
      {total > 0 && (frio + morno + quente) > 0 && (
        <div className="text-[10px] text-on-3">
          Taxa de conversão:{' '}
          <span className="font-bold text-em">
            {Math.round((fechado / total) * 100)}%
          </span>
        </div>
      )}
    </Card>
  );
}
