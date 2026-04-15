import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@lib/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, error, children, ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      <select ref={ref} className={cn(error && 'ring-1 ring-rb', className)} {...props}>
        {children}
      </select>
      {error && <span className="text-xs text-rb">{error}</span>}
    </div>
  );
});
