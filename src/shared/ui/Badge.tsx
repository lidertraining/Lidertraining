import type { ReactNode } from 'react';
import { cn } from '@lib/cn';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'xp' | 'chip' | 'chip-active';
}

export function Badge({ children, className, variant = 'xp' }: BadgeProps) {
  if (variant === 'xp') {
    return <span className={cn('xp-badge', className)}>{children}</span>;
  }
  if (variant === 'chip-active') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-chip bg-gp px-3 py-1 text-xs font-bold text-white',
          className,
        )}
      >
        {children}
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-chip bg-sf-hi px-3 py-1 text-xs font-semibold text-on-2',
        className,
      )}
    >
      {children}
    </span>
  );
}
