import { cn } from '@lib/cn';

interface ProgressBarProps {
  value: number; // 0..100
  size?: 'xs' | 'sm' | 'md';
  fillClassName?: string; // ex: "bg-gp", "bg-ge"
  className?: string;
}

export function ProgressBar({
  value,
  size = 'md',
  fillClassName = 'bg-gp',
  className,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        size === 'xs' && 'bar-xs',
        size === 'sm' && 'bar-sm',
        className,
      )}
    >
      <div className="bar-track">
        <div className={cn('bar-fill', fillClassName)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
