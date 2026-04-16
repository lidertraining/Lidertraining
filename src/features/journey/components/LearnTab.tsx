import type { JourneyStep } from '@ltypes/content';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { Markdown } from '@shared/ui/Markdown';
import { IcebreakerList } from './IcebreakerList';
import { ClosingLawsPanel } from './ClosingLawsPanel';
import { ClosingScriptsPanel } from './ClosingScriptsPanel';
import { ObjectionsPanel } from './ObjectionsPanel';
import { ContactImporter } from '@features/prospector/components/ContactImporter';
import { useAddXP } from '@features/gamification/hooks/useAddXP';

interface LearnTabProps {
  step: JourneyStep;
}

export function LearnTab({ step }: LearnTabProps) {
  const { mutate: addXP } = useAddXP();

  return (
    <div className="flex flex-col gap-5">
      {/* Hero do passo */}
      <Card variant="surface" className="flex flex-col gap-3 p-5" glow="am">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gp">
            <Icon name={step.icon} filled className="!text-[22px] text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
              Passo {step.id + 1}
            </div>
            <div className="serif text-lg font-bold">{step.name}</div>
          </div>
          {step.timeMinutes && (
            <div className="flex items-center gap-1 rounded-chip bg-sf-top px-2 py-1 text-[10px] font-semibold text-on-3">
              <Icon name="schedule" className="!text-[12px]" />
              {step.timeMinutes} min
            </div>
          )}
        </div>
        {step.goal && (
          <p className="text-sm italic text-on-2">
            <span className="font-semibold text-am">Objetivo: </span>
            {step.goal}
          </p>
        )}
      </Card>

      {/* Teoria em markdown */}
      {step.body && (
        <Card variant="surface-sm" className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Icon name="menu_book" filled className="!text-[18px] text-am" />
            <div className="serif text-base font-bold">Teoria</div>
          </div>
          <Markdown source={step.body} />
          <Button
            size="sm"
            variant="surface"
            className="self-start"
            leftIcon={<Icon name="check_circle" filled className="!text-[14px]" />}
            onClick={() => addXP({ amount: 10, reason: 'Leu teoria do passo' })}
          >
            Marquei como lido · +10 XP
          </Button>
        </Card>
      )}

      {/* Tarefas práticas */}
      {step.tasks && step.tasks.length > 0 && (
        <Card variant="surface-sm" className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Icon name="checklist" filled className="!text-[18px] text-em" />
            <div className="serif text-base font-bold">Tarefas desse passo</div>
          </div>
          <ol className="flex flex-col gap-3">
            {step.tasks.map((task, i) => (
              <li key={i} className="flex gap-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-em/20 text-[11px] font-bold text-em">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-on">{task.title}</div>
                  {task.detail && (
                    <div className="mt-0.5 text-[11px] text-on-3">{task.detail}</div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Scripts prontos */}
      {step.scripts && step.scripts.length > 0 && (
        <Card variant="surface-sm" className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Icon name="chat" filled className="!text-[18px] text-am" />
            <div className="serif text-base font-bold">Scripts prontos</div>
          </div>
          <div className="flex flex-col gap-3">
            {step.scripts.map((script, i) => (
              <div key={i} className="rounded-card bg-sf-top/40 p-3">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-on-3">
                  {script.scenario}
                </div>
                <div className="text-sm italic text-on-2">"{script.text}"</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Exemplos reais */}
      {step.examples && step.examples.length > 0 && (
        <Card variant="surface-sm" className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Icon name="auto_awesome" filled className="!text-[18px] text-gd" />
            <div className="serif text-base font-bold">Casos reais</div>
          </div>
          <ul className="flex flex-col gap-2">
            {step.examples.map((ex, i) => (
              <li key={i} className="flex gap-2 text-sm text-on-2">
                <span className="mt-0.5 text-gd">★</span>
                <span>{ex}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Erros comuns */}
      {step.mistakes && step.mistakes.length > 0 && (
        <Card variant="surface-sm" className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2">
            <Icon name="error" filled className="!text-[18px] text-rb" />
            <div className="serif text-base font-bold">Erros a evitar</div>
          </div>
          <ul className="flex flex-col gap-2">
            {step.mistakes.map((m, i) => (
              <li key={i} className="flex gap-2 text-sm text-on-2">
                <span className="mt-0.5 text-rb">✕</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Flashcards (CTA persistente) */}
      <Card variant="surface-sm" className="flex items-center gap-3 p-4">
        <Icon name="style" filled className="!text-[20px] text-am" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Revise os conceitos</div>
          <div className="text-[11px] text-on-3">
            Passe os pontos-chave desse passo pelos olhos antes da próxima prática.
          </div>
        </div>
        <Button
          size="sm"
          variant="surface"
          onClick={() => addXP({ amount: 10, reason: 'Flashcards revisados' })}
        >
          +10 XP
        </Button>
      </Card>

      {/* Componentes específicos por passo (mantidos) */}
      {step.id === 1 && (
        <div className="flex flex-col gap-2">
          <h3 className="serif text-base font-bold">Importar contatos</h3>
          <p className="text-xs text-on-3">
            Puxe os contatos do celular pra acelerar. Cada lead importado vira +15 XP.
          </p>
          <ContactImporter />
        </div>
      )}
      {step.id === 6 && <IcebreakerList />}
      {step.id === 8 && (
        <>
          <ClosingLawsPanel />
          <ObjectionsPanel />
          <ClosingScriptsPanel />
        </>
      )}
    </div>
  );
}
