import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { useToast } from '@shared/hooks/useToast';

const AGENTS = [
  { id: 'coach', icon: 'support_agent', name: 'Coach Virtual', desc: 'Feedback em tempo real' },
  { id: 'scripts', icon: 'edit_document', name: 'Gerador de Scripts', desc: 'Personalizado por persona' },
  { id: 'objections', icon: 'psychology', name: 'Analisador de Objeções', desc: 'Trate cada dúvida do lead' },
];

export function AgentsTab() {
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-on-3">
        Agentes de IA para acelerar sua prática. Em breve.
      </p>
      {AGENTS.map((a) => (
        <Card key={a.id} variant="surface-sm" className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sf-hi">
            <Icon name={a.icon} filled className="!text-[20px] text-am" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{a.name}</div>
            <div className="text-[11px] text-on-3">{a.desc}</div>
          </div>
          <button
            onClick={() => toast('Agente em breve!', 'info', 'schedule')}
            className="tap rounded-chip bg-sf-hi px-3 py-1 text-[11px] font-semibold text-on-3"
          >
            Em breve
          </button>
        </Card>
      ))}
    </div>
  );
}
