import { useState } from 'react';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { Markdown } from '@shared/ui/Markdown';
import { useToast } from '@shared/hooks/useToast';
import { STEPS } from '@content/steps';

interface Props {
  passoId: number;
  dados: Record<string, unknown>;
  setDados: (d: Record<string, unknown>) => void;
}

const RESPOSTA_SIM = [
  'Hmm, do que se trata exatamente?',
  'Parece interessante. Você pode me contar mais?',
  'Quando a gente pode conversar sobre isso?',
];

export function PassoPerformatico({ passoId, dados, setDados }: Props) {
  const step = STEPS.find((s) => s.id === passoId);
  const { toast } = useToast();
  const [simOpen, setSimOpen] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simInput, setSimInput] = useState('');
  const treinos = (dados.treinosFeitos as number) ?? 0;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast('Script copiado', 'success', 'content_copy');
    } catch { /* noop */ }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Teoria */}
      {step?.body && (
        <Card variant="surface-sm" className="p-5">
          <Markdown source={step.body} />
        </Card>
      )}

      {/* Placar de treinos */}
      <Card variant="surface" className="flex items-center gap-4 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-or/20">
          <span className="serif text-2xl font-bold text-or">{treinos}</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Treinos completados</div>
          <div className="text-[10px] text-on-3">Cada simulação conta como 1 treino</div>
        </div>
      </Card>

      {/* Scripts copiáveis */}
      {step?.scripts && step.scripts.length > 0 && (
        <Card variant="surface-sm" className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Icon name="record_voice_over" filled className="!text-[18px] text-or" />
            <div className="serif text-base font-bold">Scripts deste passo</div>
          </div>
          {step.scripts.map((s, i) => (
            <div key={i} className="rounded-card bg-sf-top/40 p-3">
              <div className="mb-1 text-[9px] font-bold uppercase tracking-wider text-or">
                {s.scenario}
              </div>
              <p className="text-[12px] italic text-on-2">"{s.text}"</p>
              <Button size="sm" variant="surface" className="mt-2"
                onClick={() => copy(s.text)}
                leftIcon={<Icon name="content_copy" className="!text-[12px]" />}>
                Copiar
              </Button>
            </div>
          ))}
        </Card>
      )}

      {/* Simulador */}
      <Card variant="surface" className="flex flex-col gap-3 p-5" glow="am">
        <div className="flex items-center gap-2">
          <Icon name="smart_toy" filled className="!text-[20px] text-or" />
          <div className="flex-1">
            <div className="serif text-base font-bold">Arena — Simulador</div>
            <div className="text-[10px] text-on-3">Pratique antes de ir pro real</div>
          </div>
        </div>

        {!simOpen ? (
          <Button variant="gp" fullWidth onClick={() => { setSimOpen(true); setSimStep(0); }}
            leftIcon={<Icon name="play_arrow" filled className="!text-[16px]" />}>
            Iniciar simulação
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            {Array.from({ length: Math.min(simStep + 1, RESPOSTA_SIM.length) }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="self-start rounded-card bg-sf-top px-3 py-2 text-[12px] text-on-2">
                  <span className="text-[9px] font-bold text-or">Contato: </span>
                  {RESPOSTA_SIM[i]}
                </div>
                {i < simStep && (
                  <div className="self-end rounded-card bg-or/20 px-3 py-2 text-[12px] text-or">Você respondeu ✓</div>
                )}
              </div>
            ))}

            {simStep < RESPOSTA_SIM.length ? (
              <div className="flex gap-2">
                <input value={simInput} onChange={(e) => setSimInput(e.target.value)}
                  placeholder="Sua resposta…"
                  className="flex-1 rounded-card bg-sf-top px-3 py-2 text-sm text-on outline-none" />
                <Button size="sm" variant="gp" disabled={!simInput.trim()}
                  onClick={() => { setSimStep((s) => s + 1); setSimInput(''); }}>
                  Enviar
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="rounded-card bg-em/10 px-3 py-2 text-center text-[12px] font-semibold text-em">
                  Simulação completa! 🎉
                </div>
                <Button size="sm" variant="ge" fullWidth onClick={() => {
                  setDados({ ...dados, treinosFeitos: treinos + 1 });
                  setSimOpen(false);
                  toast('+15 XP · Treino completado', 'xp', 'sports_esports');
                }}>
                  Concluir treino
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Erros a evitar */}
      {step?.mistakes && (
        <Card variant="surface-sm" className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <Icon name="error" filled className="!text-[16px] text-rb" />
            <div className="text-sm font-semibold">Erros fatais</div>
          </div>
          {step.mistakes.map((m, i) => (
            <div key={i} className="flex gap-2 text-[12px] text-on-2">
              <span className="text-rb">✕</span><span>{m}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
