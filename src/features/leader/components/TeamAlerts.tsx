import type { DownlineMember } from '../api/downline';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { EmptyState } from '@shared/ui/EmptyState';

interface TeamAlertsProps {
  members: DownlineMember[];
}

export function TeamAlerts({ members }: TeamAlertsProps) {
  // Considera "em risco" quem tem XP mas sem streak ativo
  const atRisk = members.filter((m) => m.streak === 0 && m.xp > 0).slice(0, 4);

  if (atRisk.length === 0) {
    return (
      <Card variant="surface-sm" className="p-4">
        <div className="flex items-center gap-2 text-em">
          <Icon name="verified" filled className="!text-[18px]" />
          <span className="text-sm font-semibold">Tudo em ordem na equipe</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-or">
        Alertas autom\u00e1ticos
      </h3>
      {atRisk.map((m) => (
        <Card
          key={m.id}
          variant="surface-sm"
          className="flex items-center gap-3 border border-or/20 p-3"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-or/20">
            <Icon name="warning" filled className="!text-[16px] text-or" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{m.name}</div>
            <div className="text-[11px] text-on-3">
              Streak perdido \u00b7 {m.xp} XP total
            </div>
          </div>
          <Icon name="chevron_right" className="!text-[18px] text-on-3" />
        </Card>
      ))}
    </div>
  );
}

export { EmptyState };
