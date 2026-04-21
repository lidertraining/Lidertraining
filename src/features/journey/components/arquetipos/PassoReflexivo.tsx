import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Textarea } from '@shared/ui/Textarea';
import { Markdown } from '@shared/ui/Markdown';
import { STEPS } from '@content/steps';
import { SonhoVisualizador } from '../SonhoVisualizador';

interface Props {
  passoId: number;
  dados: Record<string, unknown>;
  setDados: (d: Record<string, unknown>) => void;
}

export function PassoReflexivo({ passoId, dados, setDados }: Props) {
  const step = STEPS.find((s) => s.id === passoId);
  const diario = (dados.diario as string) ?? '';
  const isSonhos = passoId === 1;

  return (
    <div className="flex flex-col gap-5">
      {/* Corpo editorial */}
      {step?.body && (
        <Card variant="surface-sm" className="p-5">
          <Markdown source={step.body} />
        </Card>
      )}

      {/* Visualizador de sonho — só no Passo 1 (Sonhos) */}
      {isSonhos && <SonhoVisualizador dados={dados} setDados={setDados} />}

      {/* Diário reflexivo */}
      <Card variant="surface" className="flex flex-col gap-3 p-5" glow="am">
        <div className="flex items-center gap-2">
          <Icon name="edit_note" filled className="!text-[20px] text-am" />
          <div className="serif text-base font-bold">Diário reflexivo</div>
        </div>
        <p className="text-[11px] text-on-3">
          Escreva sem censura. Esse espaço é só seu — ninguém mais lê.
        </p>
        <Textarea
          value={diario}
          onChange={(e) => setDados({ ...dados, diario: e.target.value })}
          rows={8}
          placeholder="O que esse passo significou pra mim…"
        />
      </Card>

      {/* Citação motivacional */}
      {step?.examples && step.examples.length > 0 && (
        <Card variant="surface-sm" className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="auto_awesome" filled className="!text-[16px] text-gd" />
            <span className="text-sm font-semibold">Histórias reais</span>
          </div>
          {step.examples.map((ex, i) => (
            <div key={i} className="mb-2 rounded-card bg-sf-top/40 p-3 text-[12px] italic text-on-2">
              "{ex}"
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
