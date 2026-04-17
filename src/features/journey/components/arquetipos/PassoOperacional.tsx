import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Markdown } from '@shared/ui/Markdown';
import { ContactImporter } from '@features/prospector/components/ContactImporter';
import { useLeads } from '@features/prospector/hooks/useLeads';
import { STEPS } from '@content/steps';

interface Props {
  passoId: number;
  dados: Record<string, unknown>;
  setDados: (d: Record<string, unknown>) => void;
}

export function PassoOperacional({ passoId, dados, setDados }: Props) {
  const step = STEPS.find((s) => s.id === passoId);

  return (
    <div className="flex flex-col gap-5">
      {step?.body && (
        <Card variant="surface-sm" className="p-5">
          <Markdown source={step.body} />
        </Card>
      )}

      {/* Passo 4: Lista Viva — integra ContactImporter */}
      {passoId === 4 && <ListaVivaSection />}

      {/* Passo 10: Duplicação — sistemas */}
      {passoId === 10 && <DuplicacaoSection dados={dados} setDados={setDados} />}

      {step?.tasks && (
        <Card variant="surface-sm" className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <Icon name="checklist" filled className="!text-[16px] text-em" />
            <div className="text-sm font-semibold">Tarefas operacionais</div>
          </div>
          {step.tasks.map((t, i) => (
            <div key={i} className="flex gap-2 text-[12px] text-on-2">
              <span className="text-em font-bold">{i + 1}.</span>
              <span><strong>{t.title}</strong>{t.detail ? ` — ${t.detail}` : ''}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function ListaVivaSection() {
  const { data: leads = [] } = useLeads();
  const total = leads.length;
  const meta = 100;
  const pct = Math.min(100, (total / meta) * 100);

  return (
    <>
      <Card variant="surface" className="flex flex-col gap-3 p-5" glow="am">
        <div className="flex items-center gap-2">
          <Icon name="contacts" filled className="!text-[20px] text-am" />
          <div className="flex-1">
            <div className="serif text-base font-bold">Sua Lista Viva</div>
            <div className="text-[11px] text-on-3">
              {total}/{meta} contatos · {Math.round(pct)}% da meta
            </div>
          </div>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-sf-top">
          <div className="h-full rounded-full bg-gp transition-all" style={{ width: `${pct}%` }} />
        </div>
        {total >= meta && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-em">
            <Icon name="check_circle" filled className="!text-[14px]" /> Meta atingida!
          </div>
        )}
      </Card>
      <ContactImporter />
    </>
  );
}

function DuplicacaoSection({ dados, setDados }: { dados: Record<string, unknown>; setDados: (d: Record<string, unknown>) => void }) {
  const sistemas = (dados.sistemas as string[]) ?? [];

  const SISTEMAS_SUGERIDOS = [
    'Biblioteca de materiais compartilhada (Drive/Notion)',
    'Reunião semanal do time (dia/hora fixos)',
    '1x1 semanal com cada builder direto',
    'Régua de reconhecimento mensal',
    'Onboarding padronizado (FIR) pra cada novo consultor',
  ];

  const toggle = (item: string) => {
    const next = sistemas.includes(item)
      ? sistemas.filter((s) => s !== item)
      : [...sistemas, item];
    setDados({ ...dados, sistemas: next });
  };

  return (
    <Card variant="surface" className="flex flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <Icon name="content_copy" filled className="!text-[20px] text-em" />
        <div className="serif text-base font-bold">Sistemas de duplicação</div>
      </div>
      <p className="text-[11px] text-on-3">Marque os que você já implementou na sua rede:</p>
      {SISTEMAS_SUGERIDOS.map((s) => {
        const active = sistemas.includes(s);
        return (
          <button key={s} type="button" onClick={() => toggle(s)} className="tap flex items-center gap-3 text-left">
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition ${active ? 'bg-em text-white' : 'border-2 border-sf-top text-transparent'}`}>
              <Icon name="check" filled className="!text-[14px]" />
            </div>
            <span className={`text-sm ${active ? 'text-em' : 'text-on-2'}`}>{s}</span>
          </button>
        );
      })}
      <div className="text-[10px] text-on-3">{sistemas.length}/5 implementados</div>
    </Card>
  );
}
