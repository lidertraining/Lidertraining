import type { DownlineMember } from '../api/downline';
import { Card } from '@shared/ui/Card';
import { Avatar } from '@shared/ui/Avatar';
import { Icon } from '@shared/ui/Icon';
import { MemberActionsRow } from './MemberActionsRow';
import { formatXP } from '@lib/format';

interface TeamMemberCardProps {
  member: DownlineMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  const active = member.streak > 0;

  return (
    <Card variant="surface-sm" className="flex flex-col gap-3 p-3">
      <div className="flex items-center gap-3">
        <Avatar name={member.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{member.name}</div>
          <div className="flex items-center gap-2 text-[11px] text-on-3">
            <span>{member.level}</span>
            <span>·</span>
            <span>Passo {member.journeyStep + 1}</span>
            {member.teamCount > 0 && (
              <>
                <span>·</span>
                <span>{member.teamCount} equipe</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-am">{formatXP(member.xp)} XP</div>
          <div className="flex items-center justify-end gap-1 text-[10px]">
            <Icon
              name="local_fire_department"
              filled
              className={active ? '!text-[14px] text-or' : '!text-[14px] text-on-3'}
            />
            <span className={active ? 'text-or' : 'text-on-3'}>{member.streak}d</span>
          </div>
        </div>
      </div>
      <MemberActionsRow memberId={member.id} memberName={member.name} />
    </Card>
  );
}
