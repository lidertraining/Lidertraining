import { Link } from 'react-router-dom';
import type { TeamLearningMember } from '../api/teamLearning';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Avatar } from '@shared/ui/Avatar';
import { EmptyState } from '@shared/ui/EmptyState';
import { buildWaURL } from '@lib/phone';
import { cn } from '@lib/cn';

interface TeamAlertsProps {
  members: TeamLearningMember[];
}

interface Alert {
  member: TeamLearningMember;
  severity: 'critical' | 'warning' | 'info';
  reason: string;
  action: string;
}

/**
 * Prioridade de alertas:
 * - Crítico (vermelho): sumido há 14+ dias
 * - Aviso (amarelo): sumido há 7-14 dias OU FIR parado
 * - Info (azul): streak perdido essa semana
 */
function classifyAlerts(members: TeamLearningMember[]): Alert[] {
  const alerts: Alert[] = [];

  for (const m of members) {
    if (m.daysSinceActive >= 14) {
      alerts.push({
        member: m,
        severity: 'critical',
        reason: `${m.daysSinceActive}d sem atividade`,
        action: 'Reconexão urgente',
      });
    } else if (m.daysSinceActive >= 7) {
      alerts.push({
        member: m,
        severity: 'warning',
        reason: `${m.daysSinceActive}d sem atividade`,
        action: 'Manda um alô',
      });
    } else if (!m.firCompleted && m.firStep < 4 && m.daysSinceActive > 3) {
      alerts.push({
        member: m,
        severity: 'warning',
        reason: `FIR parado no passo ${m.firStep}`,
        action: 'Ajude a destravar',
      });
    } else if (m.streak === 0 && m.xp > 100) {
      alerts.push({
        member: m,
        severity: 'info',
        reason: 'Streak zerado',
        action: 'Incentive retomar',
      });
    }
  }

  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => {
    const s = severityOrder[a.severity] - severityOrder[b.severity];
    if (s !== 0) return s;
    return b.member.daysSinceActive - a.member.daysSinceActive;
  });

  return alerts.slice(0, 5);
}

const SEVERITY_STYLES = {
  critical: {
    bg: 'bg-rb/10 border-rb/30',
    icon: 'error',
    dot: 'bg-rb',
    labelClass: 'text-rb',
  },
  warning: {
    bg: 'bg-or/10 border-or/30',
    icon: 'warning',
    dot: 'bg-or',
    labelClass: 'text-or',
  },
  info: {
    bg: 'bg-cy/10 border-cy/30',
    icon: 'info',
    dot: 'bg-cy',
    labelClass: 'text-cy',
  },
};

export function TeamAlerts({ members }: TeamAlertsProps) {
  const alerts = classifyAlerts(members);

  if (alerts.length === 0) {
    return (
      <Card variant="surface-sm" className="flex items-center gap-2 p-4">
        <Icon name="verified" filled className="!text-[18px] text-em" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Equipe saudável</div>
          <div className="text-[11px] text-on-3">Todos ativos nos últimos 7 dias</div>
        </div>
      </Card>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <Icon name="notifications_active" filled className="!text-[16px] text-or" />
        <span>Alertas da equipe</span>
        <span className="rounded-chip bg-or/20 px-2 py-0.5 text-[10px] font-bold text-or">
          {alerts.length}
        </span>
      </h3>

      <div className="flex flex-col gap-2">
        {alerts.map(({ member, severity, reason, action }) => {
          const style = SEVERITY_STYLES[severity];
          return (
            <Card
              key={member.id}
              variant="surface-sm"
              className={cn('flex items-center gap-3 border p-3', style.bg)}
            >
              <div className="relative">
                <Avatar name={member.name} size="sm" />
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-sf-void',
                    style.dot,
                  )}
                >
                  <Icon name={style.icon} filled className="!text-[10px] text-white" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{member.name}</div>
                <div className={cn('text-[10px] font-semibold', style.labelClass)}>
                  {reason} · {action}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {member.phone && (
                  <a
                    href={buildWaURL(
                      member.phone,
                      `Oi ${member.name.split(' ')[0]}! Senti sua falta — tudo bem por aí?`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="WhatsApp"
                    className="tap flex h-8 w-8 items-center justify-center rounded-full bg-em/20 text-em hover:bg-em/30"
                  >
                    <Icon name="chat" filled className="!text-[14px]" />
                  </a>
                )}
                <Link
                  to={`/leader/team/${member.id}`}
                  className="tap flex h-8 w-8 items-center justify-center rounded-full bg-sf-top text-on-3 hover:text-on-2"
                  aria-label="Detalhe"
                >
                  <Icon name="chevron_right" className="!text-[16px]" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export { EmptyState };
