import { cn } from '@lib/cn';

interface ActivityDotProps {
  daysSinceActive: number;
  className?: string;
}

/**
 * Dot colorido de atividade:
 * - Verde (em): ativo nos últimos 2 dias
 * - Amarelo (gd): 3-7 dias
 * - Laranja (or): 8-14 dias
 * - Vermelho (rb): 15+ dias ou nunca
 */
export function ActivityDot({ daysSinceActive, className }: ActivityDotProps) {
  const color =
    daysSinceActive <= 2
      ? 'bg-em shadow-[0_0_8px_rgba(80,200,120,.6)]'
      : daysSinceActive <= 7
        ? 'bg-gd'
        : daysSinceActive <= 14
          ? 'bg-or'
          : 'bg-rb';

  const label =
    daysSinceActive <= 1
      ? 'Ativo hoje'
      : daysSinceActive <= 7
        ? `${daysSinceActive}d atrás`
        : daysSinceActive <= 30
          ? `${daysSinceActive}d atrás`
          : 'Sumido';

  return (
    <div className={cn('flex items-center gap-1.5', className)} title={label}>
      <span className={cn('h-2 w-2 rounded-full', color)} />
      <span className="text-[10px] text-on-3">{label}</span>
    </div>
  );
}
