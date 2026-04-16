import { cn } from '@lib/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Logo do LiderTraining.
 *
 * Para usar sua logo real:
 * 1. Coloque o arquivo em public/logo.svg (ou .png)
 * 2. Descomente a tag <img> abaixo e remova o fallback de texto
 */
export function Logo({ size = 'md', className }: LogoProps) {
  // ---- Descomente quando tiver o arquivo em public/logo.svg ----
  // const imgSizes = { sm: 'h-8', md: 'h-12', lg: 'h-16' };
  // return (
  //   <img
  //     src="/logo.svg"
  //     alt="LiderTraining"
  //     className={cn(imgSizes[size], 'object-contain', className)}
  //   />
  // );

  // ---- Fallback: logo em texto ----
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-3xl">💎</span>
      <div>
        <div className={cn('serif font-bold leading-tight', size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-lg')}>
          LiderTraining
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-am-dim">
          Plataforma Elite
        </div>
      </div>
    </div>
  );
}
