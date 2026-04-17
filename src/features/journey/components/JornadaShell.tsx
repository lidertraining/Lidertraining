import type { PassoMeta } from '../jornada-v2-types';
import { ARQUETIPO_CORES } from '../jornada-v2-types';
import { GavetaConhecimento } from './GavetaConhecimento';
import { Icon } from '@shared/ui/Icon';
import { cn } from '@lib/cn';

interface JornadaShellProps {
  passo: PassoMeta;
  children: React.ReactNode;
  onBack: () => void;
}

export function JornadaShell({ passo, children, onBack }: JornadaShellProps) {
  const cores = ARQUETIPO_CORES[passo.arquetipo];

  return (
    <div className="flex flex-col gap-5 pt-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="tap text-on-3">
          <Icon name="arrow_back" className="!text-[22px]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('text-[9px] font-bold uppercase tracking-[.2em]', cores.text)}>
              Passo {passo.id + 1} · {cores.badge}
            </span>
          </div>
          <h1 className="serif text-2xl font-bold">{passo.nome}</h1>
          <p className="text-[11px] text-on-3">{passo.descricao}</p>
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-full', cores.bg)}>
          <Icon name={passo.icon} filled className={cn('!text-[22px]', cores.text)} />
        </div>
      </div>

      {/* Corpo do arquétipo */}
      <div className="min-h-[50vh]">
        {children}
      </div>

      {/* Gaveta de conhecimento (puxa do banco) */}
      <GavetaConhecimento passoNum={passo.id} />
    </div>
  );
}
