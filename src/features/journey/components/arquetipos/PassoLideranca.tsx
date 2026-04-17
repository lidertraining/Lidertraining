import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Textarea } from '@shared/ui/Textarea';
import { Markdown } from '@shared/ui/Markdown';
import { STEPS } from '@content/steps';
import { useTeamLearning } from '@features/leader/hooks/useTeamLearning';
import { Avatar } from '@shared/ui/Avatar';
import { ActivityDot } from '@features/leader/components/ActivityDot';
import { formatXP } from '@lib/format';

interface Props {
  passoId: number;
  dados: Record<string, unknown>;
  setDados: (d: Record<string, unknown>) => void;
}

export function PassoLideranca({ passoId, dados, setDados }: Props) {
  const step = STEPS.find((s) => s.id === passoId);
  const { data: team = [] } = useTeamLearning(2);
  const direct = team.filter((m) => m.depth === 1);

  const plano = (dados.planoCoaching as string) ?? '';

  return (
    <div className="flex flex-col gap-5">
      {step?.body && (
        <Card variant="surface-sm" className="p-5">
          <Markdown source={step.body} />
        </Card>
      )}

      {/* Panorama da equipe */}
      <Card variant="surface" className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <Icon name="groups" filled className="!text-[20px] text-cy" />
          <div className="serif text-base font-bold">
            {passoId === 8 ? 'Quem patrocinar' : 'Quem desenvolver'}
          </div>
        </div>

        {direct.length === 0 ? (
          <p className="text-sm text-on-3">
            Sua equipe direta aparece aqui quando você patrocinar alguém.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {direct.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-card bg-sf-top/40 p-3">
                <Avatar name={m.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-semibold">{m.name}</div>
                  <div className="text-[10px] text-on-3">
                    {m.level} · {formatXP(m.xp)} XP · Jornada {m.journeyStep}/11
                  </div>
                </div>
                <ActivityDot daysSinceActive={m.daysSinceActive} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Plano de coaching */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Icon name="event_note" filled className="!text-[18px] text-cy" />
          <div className="text-sm font-semibold">
            {passoId === 8 ? 'Plano de patrocínio' : 'Plano de coaching'}
          </div>
        </div>
        <Textarea
          value={plano}
          onChange={(e) => setDados({ ...dados, planoCoaching: e.target.value })}
          rows={5}
          placeholder={passoId === 8
            ? 'Quem da minha lista eu quero patrocinar primeiro? Por que essa pessoa?'
            : 'Quais habilidades preciso desenvolver nos meus diretos esta semana?'
          }
        />
      </Card>

      {step?.tasks && (
        <Card variant="surface-sm" className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <Icon name="checklist" filled className="!text-[16px] text-cy" />
            <div className="text-sm font-semibold">Ações de liderança</div>
          </div>
          {step.tasks.map((t, i) => (
            <div key={i} className="flex gap-2 text-[12px] text-on-2">
              <span className="text-cy font-bold">{i + 1}.</span>
              <span><strong>{t.title}</strong></span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
