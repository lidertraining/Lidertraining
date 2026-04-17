import { useState } from 'react';
import type { FIRDados } from '../firTypes';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { useToast } from '@shared/hooks/useToast';
import { cn } from '@lib/cn';

interface Props {
  dados: FIRDados;
  setDados: (d: FIRDados) => void;
}

const PROTOCOLOS = [
  {
    id: 'curiosidade' as const,
    icon: 'lightbulb',
    nome: 'Curiosidade',
    tom: 'Leve e intrigante',
    regra: 'Desperte interesse sem revelar tudo. Deixe a pessoa querer saber mais.',
    script:
      'Oi [nome]! Descobri algo que tá mudando minha rotina financeira de um jeito que eu nunca imaginei. Posso te mostrar em 20 min? É rápido e acho que pode ter tudo a ver contigo.',
    cor: 'am',
  },
  {
    id: 'urgencia' as const,
    icon: 'timer',
    nome: 'Urgência',
    tom: 'Direto e oportuno',
    regra: 'Use escassez real (turma, bônus, timing). Nunca invente urgência falsa.',
    script:
      'Oi [nome]! Tô montando um time novo e abriu vaga essa semana — é limitado. Lembrei de você na hora. Tem 20 min amanhã ou quarta pra eu te mostrar?',
    cor: 'or',
  },
  {
    id: 'autenticidade' as const,
    icon: 'favorite',
    nome: 'Autenticidade',
    tom: 'Pessoal e verdadeiro',
    regra: 'Compartilhe sua história real. Vulnerabilidade gera conexão.',
    script:
      'Oi [nome], vou ser sincero contigo: entrei num projeto que tá mudando minha vida e a primeira pessoa que veio na cabeça foi você. Não é papo de vendedor — é que eu realmente acho que pode fazer diferença pra você também. Topa ouvir?',
    cor: 'em',
  },
];

const SIM_MESSAGES = [
  { from: 'contact', text: 'Opa, do que se trata?' },
  { from: 'contact', text: 'Hmm, parece interessante. Mas é venda?' },
  { from: 'contact', text: 'Tá bom, me conta mais. Quando a gente pode conversar?' },
];

export function FIRStepProtocolos({ dados, setDados }: Props) {
  const { toast } = useToast();
  const [simOpen, setSimOpen] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simInput, setSimInput] = useState('');

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast('Script copiado', 'success', 'content_copy');
    } catch {
      toast('Erro ao copiar', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="serif text-xl font-bold">Protocolos de convite</h2>
        <p className="mt-1 text-sm text-on-2">
          3 estilos de abordagem. Escolha o que combina com você — e pratique no
          simulador antes de usar no real.
        </p>
      </div>

      {/* Protocolos */}
      <div className="flex flex-col gap-3">
        {PROTOCOLOS.map((p) => {
          const selected = dados.protocoloEscolhido === p.id;
          const colorClass = `text-${p.cor}`;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setDados({ ...dados, protocoloEscolhido: p.id })}
              className="tap text-left"
            >
              <Card
                variant="surface-sm"
                className={cn(
                  'flex flex-col gap-3 p-4 transition',
                  selected && `ring-1 ring-${p.cor}/40 bg-${p.cor}/5`,
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon name={p.icon} filled className={cn('!text-[20px]', colorClass)} />
                  <div className="flex-1">
                    <div className={cn('text-sm font-bold', selected && colorClass)}>
                      {p.nome}
                    </div>
                    <div className="text-[10px] text-on-3">Tom: {p.tom}</div>
                  </div>
                  {selected && <Icon name="check_circle" filled className={cn('!text-[18px]', colorClass)} />}
                </div>

                <div className="text-[11px] text-on-3">
                  <strong>Regra:</strong> {p.regra}
                </div>

                {selected && (
                  <div className="rounded-card bg-sf-top/60 p-3">
                    <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-on-3">
                      Script
                    </div>
                    <p className="text-[12px] italic text-on-2">"{p.script}"</p>
                    <Button
                      size="sm"
                      variant="surface"
                      className="mt-2"
                      onClick={(e) => { e.stopPropagation(); copy(p.script); }}
                      leftIcon={<Icon name="content_copy" className="!text-[12px]" />}
                    >
                      Copiar
                    </Button>
                  </div>
                )}
              </Card>
            </button>
          );
        })}
      </div>

      {/* Simulador de convite */}
      <Card variant="surface" className="flex flex-col gap-3 p-4" glow="am">
        <div className="flex items-center gap-2">
          <Icon name="smart_toy" filled className="!text-[18px] text-am" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Simulador de convite</div>
            <div className="text-[10px] text-on-3">
              Pratique com um contato virtual antes do real
            </div>
          </div>
        </div>

        {!simOpen ? (
          <Button
            variant="gp"
            fullWidth
            onClick={() => { setSimOpen(true); setSimStep(0); }}
            leftIcon={<Icon name="play_arrow" filled className="!text-[16px]" />}
          >
            Iniciar simulação
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Chat history */}
            {Array.from({ length: Math.min(simStep + 1, SIM_MESSAGES.length) }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="self-start rounded-card bg-sf-top px-3 py-2 text-[12px] text-on-2">
                  <span className="text-[9px] font-bold text-or">Contato: </span>
                  {SIM_MESSAGES[i]!.text}
                </div>
                {i < simStep && (
                  <div className="self-end rounded-card bg-am/20 px-3 py-2 text-[12px] text-am">
                    Sua resposta ✓
                  </div>
                )}
              </div>
            ))}

            {simStep < SIM_MESSAGES.length ? (
              <div className="flex gap-2">
                <input
                  value={simInput}
                  onChange={(e) => setSimInput(e.target.value)}
                  placeholder="Digite sua resposta..."
                  className="flex-1 rounded-card bg-sf-top px-3 py-2 text-sm text-on outline-none"
                />
                <Button
                  size="sm"
                  variant="gp"
                  disabled={!simInput.trim()}
                  onClick={() => {
                    setSimStep((s) => s + 1);
                    setSimInput('');
                  }}
                >
                  Enviar
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="rounded-card bg-em/10 px-3 py-2 text-center text-[12px] font-semibold text-em">
                  Simulação completa! Você praticou o convite.
                </div>
                <Button
                  size="sm"
                  variant="ge"
                  fullWidth
                  onClick={() => {
                    setDados({ ...dados, praticouSimulador: true });
                    setSimOpen(false);
                  }}
                >
                  Concluir simulação
                </Button>
              </div>
            )}
          </div>
        )}

        {dados.praticouSimulador && !simOpen && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-em">
            <Icon name="check_circle" filled className="!text-[14px]" />
            Simulação praticada ✓
          </div>
        )}
      </Card>
    </div>
  );
}
