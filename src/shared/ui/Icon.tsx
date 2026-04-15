import { cn } from '@lib/cn';

interface IconProps {
  name: string;
  filled?: boolean;
  className?: string;
}

/** Wrapper do Material Symbols Outlined (fonte via Google Fonts). */
export function Icon({ name, filled, className }: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined', filled && 'filled', className)}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
