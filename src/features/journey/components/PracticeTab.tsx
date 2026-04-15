import type { JourneyStep } from '@ltypes/content';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { ObjectionsPanel } from './ObjectionsPanel';
import { useAddXP } from '@features/gamification/hooks/useAddXP';

interface PracticeTabProps {
  step: JourneyStep;
}

export function PracticeTab({ step }: PracticeTabProps) {
  const { mutate: addXP } = useAddXP();

  return (
    <div className="flex flex-col gap-4">
      <Card variant="surface" className="flex flex-col gap-3 p-5" glow="am">
        <div className="flex items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gp">
            <Icon name="sports_esports" filled className="!text-[22px] text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
              Simulador
            </div>
            <div className="serif text-base font-bold">Role-play com IA</div>
          </div>
        </div>
        <p className="text-sm text-on-2">
          Pratique {step.name.toLowerCase()} em um cen\u00e1rio simulado. Sem press\u00e3o,
          sem julgamento.
        </p>
        <Button
          variant="gp"
          leftIcon={<Icon name="play_arrow" filled className="!text-[18px]" />}
          onClick={() => addXP({ amount: 15, reason: 'Simulador praticado' })}
        >
          Iniciar pr\u00e1tica \u00b7 +15 XP
        </Button>
      </Card>

      {step.id === 8 && <ObjectionsPanel />}
    </div>
  );
}
