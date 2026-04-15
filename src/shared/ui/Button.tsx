import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@lib/cn';

type Variant = 'gp' | 'gg' | 'ge' | 'gr' | 'surface' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  gp: 'bg-gp text-white shadow-glow-am',
  gg: 'bg-gg text-sf-void',
  ge: 'bg-ge text-white',
  gr: 'bg-gr text-white',
  surface: 'bg-sf-hi text-on hover:bg-sf-top',
  ghost: 'bg-transparent text-on-2 hover:text-am',
  outline: 'border border-ov text-on hover:border-am',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-5 py-3 text-sm',
  lg: 'px-8 py-3.5 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'gp', size = 'md', leftIcon, rightIcon, fullWidth, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'tap inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-tight transition',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
});
