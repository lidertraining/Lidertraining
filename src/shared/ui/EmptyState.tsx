import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { cn } from '@lib/cn';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-12 text-center', className)}>
      <Icon name={icon} className="!text-5xl text-on-3" />
      <h3 className="serif text-lg font-bold">{title}</h3>
      {description && <p className="max-w-xs text-sm text-on-3">{description}</p>}
      {action}
    </div>
  );
}
