import type { JourneyStep } from '@ltypes/content';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
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
      <Card variant="surface" className="flex flex-col gap-3 p-5" glow="am">
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gp">
            <Icon name="headphones" filled className="!text-[22px] text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
              Podcast IA
            </div>
            <div className="serif text-base font-bold">{step.name}</div>
          </div>
        </div>
        <p className="text-sm text-on-2">{step.description}</p>
        <Button
          variant="gp"
          leftIcon={<Icon name="play_arrow" filled className="!text-[18px]" />}
        >
          Ouvir agora
        </Button>
      </Card>

      <Card variant="surface-sm" className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Icon name="style" filled className="!text-[18px] text-am" />
          <div className="flex-1 serif text-base font-bold">Flashcards</div>
          <Button
            size="sm"
            variant="surface"
            onClick={() => addXP({ amount: 10, reason: 'Flashcards revisados' })}
          >
            Revisei · +10 XP
          </Button>
        </div>
        <p className="text-xs text-on-3">
          Pratique os conceitos-chave deste passo em poucos minutos.
        </p>
      </Card>

      {step.id === 1 && (
        <div className="flex flex-col gap-2">
          <h3 className="serif text-base font-bold">Monte sua lista</h3>
          <p className="text-xs text-on-3">
            Importe seus contatos do celular para começar. Cada contato vira um
            lead no seu Prospector com +15 XP.
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
