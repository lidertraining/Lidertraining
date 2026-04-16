import type { Lead } from '@ltypes/domain';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { StatusChip } from '@shared/ui/StatusChip';
import { Avatar } from '@shared/ui/Avatar';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { relativeTime } from '@lib/relativeTime';

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
}

function onlyDigits(s: string | null): string {
  return (s ?? '').replace(/\D/g, '');
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const digits = onlyDigits(lead.phone);
  const waHref = digits ? `https://wa.me/${digits}` : null;
  const telHref = digits ? `tel:+${digits}` : null;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <Card
      variant="surface-sm"
      className="tap flex flex-col gap-2 p-3 hover-glow"
    >
      <div className="flex items-start gap-3" onClick={onClick}>
        <Avatar name={lead.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate text-sm font-semibold">{lead.name}</div>
            <StatusChip status={lead.status} />
          </div>
          <div className="mt-0.5 truncate text-[11px] text-on-3">
            {lead.source} · {lead.step ?? 'Novo contato'}
          </div>
          <div className="mt-0.5 text-[10px] text-on-3">
            {lead.lastContact
              ? `Último contato ${relativeTime(lead.lastContact)}`
              : `Criado ${relativeTime(lead.createdAt)}`}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-on-3">Score</div>
          <div className="serif text-lg font-bold text-am">{lead.score}</div>
        </div>
      </div>

      <ProgressBar value={lead.score} size="xs" fillClassName="bg-gp" />

      <div className="flex items-center gap-2">
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={stop}
            className="tap flex flex-1 items-center justify-center gap-1 rounded-chip bg-em/20 px-3 py-1.5 text-[11px] font-semibold text-em"
          >
            <Icon name="chat" filled className="!text-[14px]" />
            WhatsApp
          </a>
        )}
        {telHref && (
          <a
            href={telHref}
            onClick={stop}
            className="tap flex flex-1 items-center justify-center gap-1 rounded-chip bg-sp/20 px-3 py-1.5 text-[11px] font-semibold text-sp"
          >
            <Icon name="call" filled className="!text-[14px]" />
            Ligar
          </a>
        )}
        <button
          onClick={onClick}
          className="tap rounded-chip bg-sf-hi px-3 py-1.5 text-[11px] font-semibold text-on-2"
        >
          Editar
        </button>
      </div>
    </Card>
  );
}
