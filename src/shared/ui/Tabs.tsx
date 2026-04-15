import { cn } from '@lib/cn';

interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: string;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ items, active, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn('flex gap-1 rounded-card bg-sf-c p-1', className)}>
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'tap flex-1 rounded-card-sm px-3 py-2 text-xs font-semibold transition',
              isActive ? 'bg-gp text-white' : 'text-on-2 hover:text-on',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
