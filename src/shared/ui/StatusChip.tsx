import type { LeadStatus, TeamStatus } from '@types/domain';
import { cn } from '@lib/cn';

type Status = LeadStatus | TeamStatus;

interface StatusChipProps {
  status: Status;
  className?: string;
}

const STATUS_CLASS: Record<Status, string> = {
  frio: 'st-cold',
  morno: 'st-warm',
  quente: 'st-hot',
  fechado: 'st-closed',
  ativo: 'st-active',
  inativo: 'st-inactive',
  risco: 'st-risk',
};

const STATUS_LABEL: Record<Status, string> = {
  frio: 'Frio',
  morno: 'Morno',
  quente: 'Quente',
  fechado: 'Fechado',
  ativo: 'Ativo',
  inativo: 'Inativo',
  risco: 'Em risco',
};

export function StatusChip({ status, className }: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-chip px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
        STATUS_CLASS[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
