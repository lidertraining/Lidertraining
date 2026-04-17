import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { useAudios } from '../hooks/useAudios';

/**
 * Barra de progresso geral da Academia — mostra % de áudios ouvidos.
 * Aparece no topo pra o consultor ver o quanto falta completar a formação.
 */
export function AcademyProgress() {
  const { data: audios = [] } = useAudios();

  const total = audios.length;
  const done = audios.filter((a) => a.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card variant="surface" className="flex flex-col gap-3 p-5" glow="am">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gp">
          <Icon name="school" filled className="!text-[22px] text-white" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
            Sua formação
          </div>
          <div className="serif text-base font-bold">
            {done === total && total > 0 ? 'Academia concluída!' : 'Continue estudando'}
          </div>
        </div>
        <div className="text-right">
          <div className="serif text-2xl font-bold text-am">{pct}%</div>
          <div className="text-[10px] text-on-3">
            {done} de {total}
          </div>
        </div>
      </div>
      <ProgressBar value={pct} fillClassName="bg-gp" />
      {pct < 100 && total > 0 && (
        <p className="text-[11px] text-on-3">
          {total - done} áudio(s) restantes. Cada um vale +25 XP.
        </p>
      )}
      {pct === 100 && total > 0 && (
        <div className="flex items-center gap-2 rounded-chip bg-em/20 px-3 py-1.5 text-[11px] font-bold text-em">
          <Icon name="verified" filled className="!text-[14px]" />
          Formação completa — você é referência!
        </div>
      )}
    </Card>
  );
}
