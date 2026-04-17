import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { cn } from '@lib/cn';

interface Flashcard {
  id: string;
  frente: string;
  verso: string;
}

interface FlashcardDeckProps {
  conhecimentoId: string;
  onComplete?: () => void;
}

const QUALITY_LABELS = [
  { label: 'Errei', value: 1, color: 'bg-rb' },
  { label: 'Difícil', value: 2, color: 'bg-or' },
  { label: 'Bom', value: 3, color: 'bg-gd' },
  { label: 'Fácil', value: 5, color: 'bg-em' },
];

export function FlashcardDeck({ conhecimentoId, onComplete }: FlashcardDeckProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('flashcards')
        .select('id, frente, verso')
        .eq('conhecimento_id', conhecimentoId)
        .order('ordem');
      setCards(data ?? []);
      setLoading(false);
    })();
  }, [conhecimentoId]);

  if (loading) return <p className="text-sm text-on-3">Carregando flashcards…</p>;
  if (cards.length === 0) return <p className="text-sm text-on-3">Nenhum flashcard.</p>;

  const current = cards[idx]!;
  const isLast = idx >= cards.length - 1;

  const rate = async (quality: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('flashcard_revisoes').upsert(
        {
          user_id: user.id,
          flashcard_id: current.id,
          qualidade: quality,
          proxima_revisao: new Date(
            Date.now() + quality * 24 * 3600 * 1000,
          ).toISOString().slice(0, 10),
          revisoes: 1,
        },
        { onConflict: 'user_id,flashcard_id' },
      );
    }

    if (isLast) {
      onComplete?.();
    } else {
      setIdx((i) => i + 1);
      setFlipped(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-on-3">
        <span>
          Card {idx + 1} de {cards.length}
        </span>
        <span>{Math.round(((idx + 1) / cards.length) * 100)}%</span>
      </div>

      <button
        type="button"
        onClick={() => setFlipped(!flipped)}
        className="tap w-full"
      >
        <Card
          variant="surface"
          className={cn(
            'flex min-h-[200px] flex-col items-center justify-center p-6 text-center transition-all',
            flipped && 'ring-1 ring-am/40',
          )}
          glow="am"
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3 mb-3">
            {flipped ? 'Resposta' : 'Pergunta'}
          </div>
          <p className="serif text-lg font-bold leading-relaxed">
            {flipped ? current.verso : current.frente}
          </p>
          {!flipped && (
            <div className="mt-4 flex items-center gap-1 text-[11px] text-am">
              <Icon name="touch_app" className="!text-[14px]" />
              Toque para virar
            </div>
          )}
        </Card>
      </button>

      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          {QUALITY_LABELS.map((q) => (
            <Button
              key={q.value}
              size="sm"
              variant="surface"
              fullWidth
              onClick={() => rate(q.value)}
              className={cn('!text-[10px]', q.color === 'bg-em' && 'ring-1 ring-em/40')}
            >
              {q.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
