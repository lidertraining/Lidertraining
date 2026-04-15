import type { ReactNode } from 'react';
import { cn } from '@lib/cn';
import { Icon } from './Icon';

interface StatCardProps {
  icon: string;
  label: string;
  value: ReactNode;
  trend?: string;
  trendPositive?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  icon,
  label,
  value,
  trend,
  trendPositive,
  glow,
  className,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'surface hover-glow flex flex-col gap-1 p-3.5',
        onClick && 'tap',
        glow && 'shadow-glow-am',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-on-3">
        <Icon name={icon} className="!text-[16px]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="serif text-2xl font-bold text-on">{value}</div>
      {trend && (
        <div className={cn('text-[11px] font-semibold', trendPositive ? 'text-em' : 'text-rb')}>
          {trend}
        </div>
      )}
    </div>
  );
}
