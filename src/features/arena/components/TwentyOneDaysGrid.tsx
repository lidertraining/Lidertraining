import { useProfile } from '@shared/hooks/useProfile';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { cn } from '@lib/cn';

/**
 * Fluxo 21 dias: marca os dias em que o usuário esteve ativo.
 * Aproximado via streak (simplificação; há espaço para log de atividade real).
 */
export function TwentyOneDaysGrid() {
  const { data: profile } = useProfile();
  const active = Math.min(21, profile?.streak ?? 0);

  return (
    <Card variant="surface" className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Icon name="calendar_month" filled className="!text-[20px] text-am" />
        <div className="flex-1 serif text-base font-bold">Fluxo 21 dias</div>
        <span className="text-xs text-on-3">{active}/21</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 21 }).map((_, i) => {
          const done = i < active;
          return (
            <div
              key={i}
              className={cn(
                'flex aspect-square items-center justify-center rounded-card-sm text-[10px] font-bold',
                done ? 'bg-gp text-white shadow-glow-am' : 'bg-sf-hi text-on-3',
              )}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-on-3">
        Mantenha-se ativo 21 dias seguidos para consolidar o hábito.
      </p>
    </Card>
  );
}
