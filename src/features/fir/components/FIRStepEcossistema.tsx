import type { FIRDados } from '../firTypes';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { cn } from '@lib/cn';

interface Props {
  dados: FIRDados;
  setDados: (d: FIRDados) => void;
}

const ITEMS = [
  { key: 'cadastro' as const, icon: 'person_add', label: 'Cadastro ativo', desc: 'Seu perfil no app está completo' },
  { key: 'boasVindas' as const, icon: 'waving_hand', label: 'Boas-vindas recebidas', desc: 'Ouvi o áudio/vídeo de boas-vindas do meu patrocinador' },
  { key: 'comunidade' as const, icon: 'forum', label: 'Entrei na comunidade', desc: 'Grupo do WhatsApp / Telegram do time' },
  { key: 'mentor' as const, icon: 'support_agent', label: 'Conectei com meu mentor', desc: 'Troquei mensagem com meu upline direto' },
];

export function FIRStepEcossistema({ dados, setDados }: Props) {
  const toggle = (key: keyof FIRDados['conexoes']) => {
    setDados({
      ...dados,
      conexoes: { ...dados.conexoes, [key]: !dados.conexoes[key] },
    });
  };

  const done = Object.values(dados.conexoes).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="serif text-xl font-bold">Conecte-se ao ecossistema</h2>
        <p className="mt-1 text-sm text-on-2">
          Antes de correr, garanta que você tá plugado. Cada conexão ativa acelera seu
          início em até 3x.
        </p>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-on-3">
        <span>{done}/4 ativações</span>
        <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-sf-top">
          <div
            className="h-full rounded-full bg-am transition-all"
            style={{ width: `${(done / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {ITEMS.map((item) => {
          const active = dados.conexoes[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggle(item.key)}
              className="tap text-left"
            >
              <Card
                variant="surface-sm"
                className={cn(
                  'flex items-center gap-3 p-4 transition',
                  active && 'ring-1 ring-em/40',
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition',
                    active ? 'bg-em' : 'bg-sf-top',
                  )}
                >
                  <Icon
                    name={active ? 'check' : item.icon}
                    filled
                    className={cn('!text-[18px]', active ? 'text-white' : 'text-on-3')}
                  />
                </div>
                <div className="flex-1">
                  <div className={cn('text-sm font-semibold', active && 'text-em')}>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-on-3">{item.desc}</div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
