import { Icon } from '@shared/ui/Icon';
import { useToast } from '@shared/providers/ToastProvider';
import { cn } from '@lib/cn';

interface MemberActionsRowProps {
  memberName: string;
}

const ACTIONS = [
  { id: 'wa', icon: 'chat', label: 'WhatsApp', color: 'em' as const },
  { id: '1x1', icon: 'event', label: '1x1', color: 'am' as const },
  { id: 'reminder', icon: 'alarm', label: 'Lembrete', color: 'or' as const },
  { id: 'recog', icon: 'celebration', label: 'Reconhecer', color: 'gd' as const },
];

const COLOR_CLASS: Record<string, string> = {
  em: 'bg-em/15 text-em',
  am: 'bg-am-darker/30 text-am',
  or: 'bg-or/15 text-or',
  gd: 'bg-gd/15 text-gd',
};

export function MemberActionsRow({ memberName }: MemberActionsRowProps) {
  const { toast } = useToast();

  const onClick = (id: string) => {
    const messages: Record<string, string> = {
      wa: `Abrindo conversa com ${memberName}\u2026`,
      '1x1': `1x1 com ${memberName} agendado`,
      reminder: `Lembrete enviado para ${memberName}`,
      recog: `Reconhecimento p\u00fablico para ${memberName}`,
    };
    toast(messages[id] ?? 'A\u00e7\u00e3o executada', 'success');
  };

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {ACTIONS.map((a) => (
        <button
          key={a.id}
          onClick={() => onClick(a.id)}
          className={cn(
            'tap flex flex-col items-center gap-1 rounded-card-sm p-2 text-[10px] font-semibold',
            COLOR_CLASS[a.color],
          )}
        >
          <Icon name={a.icon} filled className="!text-[16px]" />
          {a.label}
        </button>
      ))}
    </div>
  );
}
