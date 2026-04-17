import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Logo } from '@shared/ui/Logo';

interface FIRWelcomeProps {
  userName: string;
  onStart: () => void;
}

const FASES = [
  {
    icon: 'hub',
    titulo: 'Conectar',
    desc: 'Integre-se ao ecossistema e defina seu propósito.',
    cor: 'text-am',
  },
  {
    icon: 'rocket_launch',
    titulo: 'Preparar',
    desc: 'Configure seu ritmo, produtos e primeira reunião.',
    cor: 'text-gd',
  },
  {
    icon: 'diversity_3',
    titulo: 'Ativar',
    desc: 'Domine os protocolos e monte sua lista viva.',
    cor: 'text-em',
  },
];

export function FIRWelcome({ userName, onStart }: FIRWelcomeProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <Logo size="lg" />

      <div>
        <div className="text-[10px] font-bold uppercase tracking-[.25em] text-am">
          FIR — Ficha de Início Rápido
        </div>
        <h1 className="serif mt-2 text-3xl font-bold">
          Bem-vindo(a), {userName.split(' ')[0]}
        </h1>
        <p className="mt-2 text-sm text-on-2">
          Nos próximos minutos você vai configurar tudo pra começar com o pé direito.
          São 8 passos, ~50 minutos, e você sai daqui pronto(a) pra ação.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        {FASES.map((f, i) => (
          <Card key={i} variant="surface-sm" className="flex items-center gap-3 p-4 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sf-top">
              <Icon name={f.icon} filled className={`!text-[20px] ${f.cor}`} />
            </div>
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-on-3">
                Fase {i + 1}
              </div>
              <div className="text-sm font-bold">{f.titulo}</div>
              <div className="text-[11px] text-on-3">{f.desc}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-on-3">
        <Icon name="star" filled className="!text-[14px] text-am" />
        <span>
          <strong className="text-am">+1.300 XP</strong> ao completar
        </span>
      </div>

      <Button variant="ge" fullWidth onClick={onStart} className="max-w-xs">
        Começar minha jornada
      </Button>
    </div>
  );
}
