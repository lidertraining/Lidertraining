import { cn } from '@lib/cn';

interface LearningMiniBarProps {
  label: string;
  value: number;
  total: number;
  colorClass?: string;
  className?: string;
}

/**
 * Mini barra de progresso compacta para cards da equipe.
 * Mostra "label · value/total" + barra pequena colorida.
 */
export function LearningMiniBar({
  label,
  value,
  total,
  colorClass = 'bg-am',
  className,
}: LearningMiniBarProps) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-on-3">{label}</span>
        <span className="font-semibold text-on-2">
          {value}/{total}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-chip bg-sf-top">
        <div
          className={cn('h-full rounded-chip transition-all', colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
