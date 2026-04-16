import { useState } from 'react';
import type { JourneyStep } from '@ltypes/content';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { ObjectionsPanel } from './ObjectionsPanel';
import { useAddXP } from '@features/gamification/hooks/useAddXP';
import { useToast } from '@shared/hooks/useToast';

interface PracticeTabProps {
  step: JourneyStep;
}

export function PracticeTab({ step }: PracticeTabProps) {
  const { mutate: addXP } = useAddXP();
  const { toast } = useToast();
  const [practiced, setPracticed] = useState(false);

  const hasScripts = (step.scripts?.length ?? 0) > 0;
  const hasExamples = (step.examples?.length ?? 0) > 0;
  const hasMistakes = (step.mistakes?.length ?? 0) > 0;

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} copiado`, 'success', 'content_copy');
    } catch {
      toast('Erro ao copiar', 'error');
    }
  };

  const markPracticed = () => {
    if (practiced) return;
    setPracticed(true);
    addXP({ amount: 15, reason: `Praticou passo ${step.id + 1}` });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hero "pratique em voz alta" */}
      <Card variant="surface" className="flex flex-col gap-3 p-5" glow="am">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gp">
            <Icon name="sports_esports" filled className="!text-[22px] text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
              Simulador
            </div>
            <div className="serif text-base font-bold">Pratique em voz alta</div>
          </div>
        </div>
        <p className="text-sm text-on-2">
          Leia cada script no tom que você usaria na vida real. Grave um áudio no WhatsApp,
          ouça de volta e ajuste até soar natural. Errar aqui é barato.
        </p>
        <Button
          variant="gp"
          leftIcon={<Icon name="mic" filled className="!text-[18px]" />}
          onClick={markPracticed}
          disabled={practiced}
        >
          {practiced ? 'Praticado · +15 XP' : 'Marquei pratiquei · +15 XP'}
        </Button>
      </Card>

      {/* Scripts do passo (roleplay) */}
      {hasScripts && (
        <Card variant="surface-sm" className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Icon name="record_voice_over" filled className="!text-[18px] text-am" />
            <div className="flex-1 serif text-base font-bold">
              Cenários pra treinar
            </div>
          </div>
          <p className="text-[11px] text-on-3">
            Treine cada cenário no espelho ou gravando áudio. Copie e cole direto no WhatsApp.
          </p>
          <div className="flex flex-col gap-3">
            {step.scripts!.map((script, i) => (
              <div key={i} className="rounded-card bg-sf-top/40 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-am">
                    {script.scenario}
                  </div>
                  <Button
                    size="sm"
                    variant="surface"
                    leftIcon={<Icon name="content_copy" className="!text-[12px]" />}
                    onClick={() => copy(script.text, 'Script')}
                  >
                    Copiar
                  </Button>
                </div>
                <div className="text-sm italic text-on-2">"{script.text}"</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Exemplos reais */}
      {hasExamples && (
        <Card variant="surface-sm" className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Icon name="auto_awesome" filled className="!text-[18px] text-gd" />
            <div className="flex-1 serif text-base font-bold">
              Casos que aconteceram
            </div>
          </div>
          <p className="text-[11px] text-on-3">
            Espelhe-se. Histórias reais são mais úteis que teoria.
          </p>
          <ul className="flex flex-col gap-2">
            {step.examples!.map((ex, i) => (
              <li key={i} className="flex gap-2 text-sm text-on-2">
                <span className="mt-0.5 text-gd">★</span>
                <span>{ex}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Erros comuns (pra fugir) */}
      {hasMistakes && (
        <Card variant="surface-sm" className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Icon name="error" filled className="!text-[18px] text-rb" />
            <div className="flex-1 serif text-base font-bold">
              Erros que matam a prática
            </div>
          </div>
          <ul className="flex flex-col gap-2">
            {step.mistakes!.map((m, i) => (
              <li key={i} className="flex gap-2 text-sm text-on-2">
                <span className="mt-0.5 text-rb">✕</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Extras específicos */}
      {step.id === 8 && <ObjectionsPanel />}

      {/* Fallback: passo sem conteúdo de prática ainda */}
      {!hasScripts && !hasExamples && !hasMistakes && (
        <Card variant="surface-sm" className="flex flex-col gap-2 p-5">
          <p className="text-sm text-on-2">
            Este passo ainda não tem cenários de prática específicos. Use o caderno da aba
            Tarefas pra registrar o que você treinou e o que aprendeu.
          </p>
        </Card>
      )}
    </div>
  );
}
