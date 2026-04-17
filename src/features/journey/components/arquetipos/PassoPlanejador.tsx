
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Input } from '@shared/ui/Input';
import { Markdown } from '@shared/ui/Markdown';
import { STEPS } from '@content/steps';
import { formatBRL } from '@lib/format';

interface Props {
  passoId: number;
  dados: Record<string, unknown>;
  setDados: (d: Record<string, unknown>) => void;
}

export function PassoPlanejador({ passoId, dados, setDados }: Props) {
  const step = STEPS.find((s) => s.id === passoId);

  if (passoId === 2) return <MetasPlanner dados={dados} setDados={setDados} step={step} />;
  if (passoId === 3) return <ProdutoPlanner dados={dados} setDados={setDados} step={step} />;
  return <GenericPlanner step={step} />;
}

function MetasPlanner({ dados, setDados, step }: { dados: Record<string, unknown>; setDados: (d: Record<string, unknown>) => void; step: typeof STEPS[0] | undefined }) {
  const meta30 = (dados.meta30 as number) ?? 2000;
  const meta90 = (dados.meta90 as number) ?? 5000;
  const meta365 = (dados.meta365 as number) ?? 20000;

  return (
    <div className="flex flex-col gap-5">
      {step?.body && <Card variant="surface-sm" className="p-5"><Markdown source={step.body} /></Card>}

      <Card variant="surface" className="flex flex-col gap-4 p-5" glow="gd">
        <div className="flex items-center gap-2">
          <Icon name="flag" filled className="!text-[20px] text-gd" />
          <div className="serif text-base font-bold">Suas metas financeiras</div>
        </div>

        <SliderMeta label="30 dias" value={meta30} min={500} max={10000} step={500}
          onChange={(v) => setDados({ ...dados, meta30: v })} />
        <SliderMeta label="90 dias" value={meta90} min={1000} max={30000} step={1000}
          onChange={(v) => setDados({ ...dados, meta90: v })} />
        <SliderMeta label="1 ano" value={meta365} min={5000} max={100000} step={5000}
          onChange={(v) => setDados({ ...dados, meta365: v })} />

        <div className="rounded-card bg-gd/10 p-3 text-center">
          <div className="text-[9px] font-bold uppercase tracking-wider text-on-3">Projeção anual</div>
          <div className="serif text-xl font-bold text-gd">{formatBRL(meta365)}</div>
        </div>
      </Card>
    </div>
  );
}

function ProdutoPlanner({ dados, setDados, step }: { dados: Record<string, unknown>; setDados: (d: Record<string, unknown>) => void; step: typeof STEPS[0] | undefined }) {
  const kitEscolhido = (dados.kit as string) ?? '';

  return (
    <div className="flex flex-col gap-5">
      {step?.body && <Card variant="surface-sm" className="p-5"><Markdown source={step.body} /></Card>}

      <Card variant="surface" className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <Icon name="inventory_2" filled className="!text-[20px] text-gd" />
          <div className="serif text-base font-bold">Escolha do kit</div>
        </div>
        <Input
          value={kitEscolhido}
          onChange={(e) => setDados({ ...dados, kit: e.target.value })}
          placeholder="Nome do kit que você vai pedir (ex: Kit Start, Kit Pro)"
        />
      </Card>

      {step?.tasks && (
        <Card variant="surface-sm" className="flex flex-col gap-2 p-4">
          <div className="text-sm font-semibold">Tarefas deste passo</div>
          {step.tasks.map((t, i) => (
            <div key={i} className="flex gap-2 text-[12px] text-on-2">
              <span className="text-em">•</span>
              <span><strong>{t.title}</strong> {t.detail && `— ${t.detail}`}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function GenericPlanner({ step }: { step: typeof STEPS[0] | undefined }) {
  return step?.body ? <Card variant="surface-sm" className="p-5"><Markdown source={step.body} /></Card> : null;
}

function SliderMeta({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-on-3">{label}</span>
        <span className="serif font-bold text-gd">{formatBRL(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full appearance-none rounded-full bg-sf-top accent-gd" />
    </div>
  );
}
