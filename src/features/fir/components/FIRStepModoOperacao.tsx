import type { FIRDados } from '../firTypes';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { cn } from '@lib/cn';

interface Props {
  dados: FIRDados;
  setDados: (d: FIRDados) => void;
}

const MODOS = [
  {
    id: 'flex' as const,
    nome: 'Flex',
    horas: '6h/sem',
    desc: 'Começa leve, no seu tempo. Ideal pra quem tem rotina pesada.',
    projecao: 'R$ 800–1.500/mês em 90 dias',
    icon: 'self_improvement',
    cor: 'text-cy',
    bg: 'bg-cy/10',
    ring: 'ring-cy/30',
  },
  {
    id: 'forte' as const,
    nome: 'Forte',
    horas: '12h/sem',
    desc: 'Ritmo consistente. Resultados visíveis no primeiro mês.',
    projecao: 'R$ 2.000–4.000/mês em 90 dias',
    icon: 'fitness_center',
    cor: 'text-am',
    bg: 'bg-am/10',
    ring: 'ring-am/30',
  },
  {
    id: 'elite' as const,
    nome: 'Elite',
    horas: '24h/sem',
    desc: 'Full commitment. Acelera o plano de carreira em 3x.',
    projecao: 'R$ 5.000–10.000/mês em 90 dias',
    icon: 'bolt',
    cor: 'text-gd',
    bg: 'bg-gd/10',
    ring: 'ring-gd/30',
  },
];

export function FIRStepModoOperacao({ dados, setDados }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="serif text-xl font-bold">Modo de operação</h2>
        <p className="mt-1 text-sm text-on-2">
          Não existe certo ou errado — existe o ritmo que cabe na sua vida agora.
          Você pode trocar depois.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {MODOS.map((modo) => {
          const selected = dados.modoOperacao === modo.id;
          return (
            <button
              key={modo.id}
              type="button"
              onClick={() => setDados({ ...dados, modoOperacao: modo.id })}
              className="tap text-left"
            >
              <Card
                variant="surface-sm"
                className={cn(
                  'flex flex-col gap-3 p-5 transition',
                  selected && `ring-1 ${modo.ring} ${modo.bg}`,
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                      selected ? modo.bg : 'bg-sf-top',
                    )}
                  >
                    <Icon
                      name={modo.icon}
                      filled
                      className={cn('!text-[24px]', selected ? modo.cor : 'text-on-3')}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('serif text-lg font-bold', selected && modo.cor)}>
                        {modo.nome}
                      </span>
                      <span className="rounded-chip bg-sf-top px-2 py-0.5 text-[10px] font-bold text-on-3">
                        {modo.horas}
                      </span>
                    </div>
                    <div className="text-[11px] text-on-3">{modo.desc}</div>
                  </div>
                  {selected && (
                    <Icon name="check_circle" filled className={`!text-[22px] ${modo.cor}`} />
                  )}
                </div>

                {selected && (
                  <div className={cn('rounded-card p-3 text-center', modo.bg)}>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-on-3">
                      Projeção de ganho
                    </div>
                    <div className={cn('serif mt-1 text-base font-bold', modo.cor)}>
                      {modo.projecao}
                    </div>
                  </div>
                )}
              </Card>
            </button>
          );
        })}
      </div>

      <p className="text-center text-[10px] italic text-on-3">
        Projeções baseadas em consultores ativos com acompanhamento do upline. Resultados
        individuais variam.
      </p>
    </div>
  );
}
