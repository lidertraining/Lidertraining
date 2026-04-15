import type { DownlineMember } from '@features/leader/api/downline';
import { Avatar } from '@shared/ui/Avatar';
import { Icon } from '@shared/ui/Icon';
import { formatXP } from '@lib/format';
import { cn } from '@lib/cn';

interface NetworkNodeProps {
  member: DownlineMember;
  nested?: DownlineMember[];
  allMembers: DownlineMember[];
}

export function NetworkNode({ member, nested = [], allMembers }: NetworkNodeProps) {
  return (
    <div className="flex flex-col">
      <div
        className="flex items-center gap-2 rounded-card-sm bg-sf-hi p-2.5"
        style={{ marginLeft: member.depth > 1 ? 0 : undefined }}
      >
        <Avatar name={member.name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold">{member.name}</div>
          <div className="text-[10px] text-on-3">
            {member.level} \u00b7 {formatXP(member.xp)} XP
          </div>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 rounded-chip px-2 py-0.5 text-[10px] font-bold',
            member.streak > 0 ? 'bg-or/20 text-or' : 'bg-sf-top text-on-3',
          )}
        >
          <Icon name="local_fire_department" filled className="!text-[12px]" />
          {member.streak}
        </div>
      </div>

      {nested.length > 0 && (
        <div className="ml-5 mt-1.5 flex flex-col gap-1.5 border-l-2 border-am-darker/30 pl-3">
          {nested.map((child) => {
            const grandchildren = allMembers.filter((m) => m.uplineId === child.id);
            return (
              <NetworkNode
                key={child.id}
                member={child}
                nested={grandchildren}
                allMembers={allMembers}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
