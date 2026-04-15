import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      <input ref={ref} className={cn(error && 'ring-1 ring-rb', className)} {...props} />
      {error && <span className="text-xs text-rb">{error}</span>}
    </div>
  );
});
