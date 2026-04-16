import { cn } from '@lib/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const IMG_SIZES = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-20',
  xl: 'h-28',
};

export function Logo({ size = 'md', className }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="LiderTraining"
      className={cn(
        IMG_SIZES[size],
        'rounded-lg object-contain mix-blend-lighten',
        className,
      )}
    />
  );
}
