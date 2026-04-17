import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { Confetti } from '@shared/ui/Confetti';
import { cn } from '@lib/cn';

interface Pergunta {
  id: string;
  pergunta: string;
  alternativas: string[];
  resposta_correta: number;
  explicacao: string | null;
}

interface QuizRunnerProps {
  conhecimentoId: string;
  xpReward: number;
  onComplete?: () => void;
}

export function QuizRunner({ conhecimentoId, xpReward, onComplete }: QuizRunnerProps) {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [corretas, setCorretas] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('quiz_perguntas')
        .select('id, pergunta, alternativas, resposta_correta, explicacao')
        .eq('conhecimento_id', conhecimentoId)
        .order('ordem');
      setPerguntas(data ?? []);
      setLoading(false);
    })();
  }, [conhecimentoId]);

  if (loading) return <p className="text-sm text-on-3">Carregando quiz…</p>;
  if (perguntas.length === 0) return <p className="text-sm text-on-3">Nenhuma pergunta.</p>;

  if (finished) {
    const pct = Math.round((corretas / perguntas.length) * 100);
    return (
      <Card variant="surface" className="flex flex-col items-center gap-4 p-6 text-center" glow="gd">
        <Confetti active={pct >= 70} />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gg">
          <Icon
            name={pct >= 70 ? 'emoji_events' : 'psychology'}
            filled
            className="!text-[32px] text-sf-void"
          />
        </div>
        <div>
          <div className="serif text-2xl font-bold">{pct}%</div>
          <div className="text-sm text-on-2">
            {corretas} de {perguntas.length} corretas
          </div>
        </div>
        <div className="text-sm text-on-2">
          {pct >= 90
            ? 'Excelente! Você dominou o conteúdo.'
            : pct >= 70
              ? 'Muito bom! Revise os pontos que errou.'
              : 'Continue estudando e tente de novo.'}
        </div>
        {pct >= 70 && (
          <div className="flex items-center gap-1 rounded-chip bg-am/20 px-3 py-1 text-sm font-bold text-am">
            <Icon name="star" filled className="!text-[14px]" />
            +{xpReward} XP
          </div>
        )}
      </Card>
    );
  }

  const current = perguntas[idx]!;
  const isCorrect = selected === current.resposta_correta;

  const confirm = async () => {
    if (selected === null) return;
    setRevealed(true);
    if (isCorrect) setCorretas((c) => c + 1);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('quiz_respostas').insert({
        user_id: user.id,
        pergunta_id: current.id,
        resposta_escolhida: selected,
        correta: isCorrect,
      });
    }
  };

  const next = () => {
    if (idx >= perguntas.length - 1) {
      setFinished(true);
      const finalCorretas = corretas + (isCorrect ? 0 : 0);
      const finalPct = ((finalCorretas) / perguntas.length) * 100;
      if (finalPct >= 70) onComplete?.();
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-on-3">
        <span>
          Pergunta {idx + 1} de {perguntas.length}
        </span>
        <span>{corretas} correta(s)</span>
      </div>

      <Card variant="surface" className="flex flex-col gap-4 p-5">
        <p className="serif text-base font-bold">{current.pergunta}</p>

        <div className="flex flex-col gap-2">
          {current.alternativas.map((alt, i) => {
            const isThis = selected === i;
            const isAnswer = current.resposta_correta === i;
            let style = 'bg-sf-top/60 text-on-2';
            if (revealed && isAnswer) style = 'bg-em/20 text-em ring-1 ring-em/40';
            else if (revealed && isThis && !isAnswer) style = 'bg-rb/20 text-rb ring-1 ring-rb/40';
            else if (isThis) style = 'bg-am/20 text-am ring-1 ring-am/40';

            return (
              <button
                key={i}
                type="button"
                disabled={revealed}
                onClick={() => setSelected(i)}
                className={cn(
                  'tap flex items-center gap-3 rounded-card p-3 text-left text-sm transition',
                  style,
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sf-top text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{alt}</span>
                {revealed && isAnswer && (
                  <Icon name="check_circle" filled className="!text-[18px] text-em" />
                )}
                {revealed && isThis && !isAnswer && (
                  <Icon name="cancel" filled className="!text-[18px] text-rb" />
                )}
              </button>
            );
          })}
        </div>

        {revealed && current.explicacao && (
          <div className="rounded-card bg-sf-top/40 p-3 text-[12px] text-on-2">
            <span className="font-semibold text-am">Explicação: </span>
            {current.explicacao}
          </div>
        )}

        <div className="flex gap-2">
          {!revealed ? (
            <Button variant="gp" fullWidth disabled={selected === null} onClick={confirm}>
              Confirmar
            </Button>
          ) : (
            <Button variant="ge" fullWidth onClick={next}>
              {idx >= perguntas.length - 1 ? 'Ver resultado' : 'Próxima'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
