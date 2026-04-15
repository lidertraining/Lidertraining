import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'surface-sm' | 'glass' | 'glass-lite';
  glow?: 'am' | 'gd' | null;
  children: ReactNode;
}

export function Card({ variant = 'surface', glow, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        variant,
        glow === 'am' && 'shadow-glow-am',
        glow === 'gd' && 'shadow-glow-gd',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
