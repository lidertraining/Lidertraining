import type { FIRDados } from '../firTypes';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Input } from '@shared/ui/Input';
import { cn } from '@lib/cn';

interface Props {
  dados: FIRDados;
  setDados: (d: FIRDados) => void;
}

const MODALIDADES = [
  {
    id: 'presencial' as const,
    icon: 'handshake',
    label: 'Presencial',
    desc: 'Encontro ao vivo com seu upline. Maior energia e conexão.',
  },
  {
    id: 'online' as const,
    icon: 'videocam',
    label: 'Online',
    desc: 'Zoom, Meet ou WhatsApp. Flexível, sem deslocamento.',
  },
];

export function FIRStepReuniao({ dados, setDados }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="serif text-xl font-bold">Primeira reunião</h2>
        <p className="mt-1 text-sm text-on-2">
          Agende sua primeira reunião 1x1 com seu upline. É aqui que seu plano de 30 dias
          é desenhado juntos.
        </p>
      </div>

      {/* Modalidade */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <div className="text-sm font-semibold">Como vai ser?</div>
        <div className="grid grid-cols-2 gap-2">
          {MODALIDADES.map((m) => {
            const selected = dados.modoReuniao === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setDados({ ...dados, modoReuniao: m.id })}
                className="tap text-left"
              >
                <Card
                  variant="surface-sm"
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 text-center transition',
                    selected && 'ring-1 ring-am/40 bg-am/5',
                  )}
                >
                  <Icon
                    name={m.icon}
                    filled
                    className={cn('!text-[24px]', selected ? 'text-am' : 'text-on-3')}
                  />
                  <div className={cn('text-sm font-bold', selected && 'text-am')}>
                    {m.label}
                  </div>
                  <div className="text-[10px] text-on-3">{m.desc}</div>
                  {selected && <Icon name="check_circle" filled className="!text-[16px] text-am" />}
                </Card>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Data e hora */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Icon name="event" filled className="!text-[18px] text-gd" />
          <div className="text-sm font-semibold">Data e horário</div>
        </div>
        <Input
          type="datetime-local"
          value={dados.dataReuniao}
          onChange={(e) => setDados({ ...dados, dataReuniao: e.target.value })}
        />
        <p className="text-[10px] text-on-3">
          Escolha um horário que funcione pro seu upline também. Se ainda não combinou,
          marque uma data provisória e ajuste depois.
        </p>
      </Card>

      {dados.dataReuniao && (
        <div className="flex items-center gap-2 rounded-card bg-em/10 px-4 py-3 text-[11px] font-semibold text-em">
          <Icon name="check_circle" filled className="!text-[14px]" />
          Reunião agendada para{' '}
          {new Date(dados.dataReuniao).toLocaleString('pt-BR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
          {' · '}
          {dados.modoReuniao === 'presencial' ? 'presencial' : 'online'}
        </div>
      )}
    </div>
  );
}
