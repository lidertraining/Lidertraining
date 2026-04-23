import { Link } from 'react-router-dom';
import type { TeamLearningMember } from '../api/teamLearning';
import { Card } from '@shared/ui/Card';
import { Avatar } from '@shared/ui/Avatar';
import { Icon } from '@shared/ui/Icon';
import { LearningMiniBar } from './LearningMiniBar';
import { ActivityDot } from './ActivityDot';
import { formatXP } from '@lib/format';
import { buildWaURL } from '@lib/phone';

interface LearningMemberCardProps {
  member: TeamLearningMember;
}

/**
 * Card de membro com foco em progresso de aprendizado.
 * Clicável: leva para /leader/team/:id com detalhes completos.
 */
export function LearningMemberCard({ member }: LearningMemberCardProps) {
  // 11 passos no total (0-10)
  const journeyPct = Math.min(100, Math.round((member.journeyStep / 10) * 100));
  const firPct = member.firCompleted ? 100 : Math.round((member.firStep / 8) * 100);

  return (
    <Link to={`/leader/team/${member.id}`} className="tap block">
      <Card variant="surface-sm" className="flex flex-col gap-3 p-3 hover-glow">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar name={member.name} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold">{member.name}</span>
              {member.depth > 1 && (
                <span className="rounded-chip bg-sf-top px-1.5 py-0.5 text-[9px] font-bold text-on-3">
                  N{member.depth}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-on-3">
              <span>{member.level}</span>
              <span>·</span>
              <span className="text-am font-semibold">{formatXP(member.xp)} XP</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ActivityDot daysSinceActive={member.daysSinceActive} />
            {member.phone && (
              <a
                href={buildWaURL(member.phone, `Oi ${member.name.split(' ')[0]}, tudo bem?`) ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Falar com ${member.name} no WhatsApp`}
                className="tap flex h-8 w-8 items-center justify-center rounded-full bg-em/15 text-em hover:bg-em/25"
              >
                <Icon name="chat" filled className="!text-[16px]" />
              </a>
            )}
          </div>
        </div>

        {/* Barras de progresso */}
        <div className="grid grid-cols-2 gap-3">
          <LearningMiniBar
            label="Jornada"
            value={member.journeyStep}
            total={10}
            colorClass="bg-gp"
          />
          <LearningMiniBar
            label="FIR"
            value={member.firCompleted ? 8 : member.firStep}
            total={8}
            colorClass={member.firCompleted ? 'bg-em' : 'bg-gg'}
          />
          <LearningMiniBar
            label="Áudios"
            value={member.audiosDone}
            total={member.audiosTotal || 8}
            colorClass="bg-cy"
          />
          <LearningMiniBar
            label="Leads"
            value={member.leadsCount}
            total={Math.max(50, member.leadsCount)}
            colorClass="bg-or"
          />
        </div>

        {/* Footer métrica rápida */}
        <div className="flex items-center justify-between border-t border-sf-top/40 pt-2 text-[10px]">
          <div className="flex items-center gap-3 text-on-3">
            <span className="flex items-center gap-1">
              <Icon name="local_fire_department" filled className="!text-[12px] text-or" />
              {member.streak}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="edit_note" filled className="!text-[12px] text-am" />
              {member.notesWritten}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="star" filled className="!text-[12px] text-am" />
              {formatXP(member.weeklyXP)} sem.
            </span>
          </div>
          <div className="flex items-center gap-1 text-am font-semibold">
            Ver detalhes
            <Icon name="chevron_right" className="!text-[14px]" />
          </div>
        </div>

        {/* Aliases visuais */}
        <span className="sr-only">Jornada {journeyPct}% · FIR {firPct}%</span>
      </Card>
    </Link>
  );
}
