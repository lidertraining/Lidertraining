import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@lib/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, error, ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      <textarea ref={ref} className={cn(error && 'ring-1 ring-rb', className)} {...props} />
      {error && <span className="text-xs text-rb">{error}</span>}
    </div>
  );
});
