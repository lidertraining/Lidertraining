import type { Lead, LeadStatus } from '@types/domain';
import { cn } from '@lib/cn';

export type FilterValue = 'todos' | LeadStatus;

interface LeadFiltersProps {
  active: FilterValue;
  onChange: (v: FilterValue) => void;
  leads: Lead[];
}

const FILTERS: { id: FilterValue; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'quente', label: 'Quente' },
  { id: 'morno', label: 'Morno' },
  { id: 'frio', label: 'Frio' },
  { id: 'fechado', label: 'Fechado' },
];

export function LeadFilters({ active, onChange, leads }: LeadFiltersProps) {
  const count = (id: FilterValue) =>
    id === 'todos' ? leads.length : leads.filter((l) => l.status === id).length;

  return (
    <div className="no-scroll -mx-4 flex overflow-x-auto px-4">
      <div className="flex gap-2">
        {FILTERS.map((f) => {
          const n = count(f.id);
          const isActive = f.id === active;
          return (
            <button
              key={f.id}
              onClick={() => onChange(f.id)}
              className={cn(
                'tap shrink-0 rounded-chip px-3 py-1.5 text-xs font-semibold transition',
                isActive ? 'bg-gp text-white' : 'bg-sf-hi text-on-2 hover:text-on',
              )}
            >
              {f.label}
              <span
                className={cn(
                  'ml-1.5 rounded-chip px-1.5 py-0.5 text-[10px]',
                  isActive ? 'bg-white/20' : 'bg-sf-top text-on-3',
                )}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
