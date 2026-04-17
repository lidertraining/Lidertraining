import { useState } from 'react';
import { useConhecimentos } from '@features/conhecimentos/hooks/useConhecimentos';
import { ConhecimentoPlayer, type Conhecimento } from '@features/conhecimentos/components/ConhecimentoPlayer';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Modal } from '@shared/ui/Modal';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { cn } from '@lib/cn';

interface GavetaProps {
  passoNum: number;
}

const TIPO_ICON: Record<string, string> = {
  audio: 'headphones',
  video: 'videocam',
  report: 'description',
  mapa_mental: 'account_tree',
  flashcards: 'style',
  quiz: 'quiz',
};

export function GavetaConhecimento({ passoNum }: GavetaProps) {
  const { data: items = [] } = useConhecimentos({ passo_jornada: passoNum });
  const [playing, setPlaying] = useState<(Conhecimento & { consumo?: { posicao_segundos: number; progresso_pct: number; concluido: boolean } | null }) | null>(null);

  if (items.length === 0) return null;

  const done = items.filter((i: { consumo?: { concluido?: boolean } | null }) => i.consumo?.concluido).length;

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="auto_stories" filled className="!text-[18px] text-am" />
            <h2 className="serif text-base font-bold">Conteúdo deste passo</h2>
          </div>
          {items.length > 0 && (
            <span className="text-[10px] text-on-3">
              {done}/{items.length} concluído(s)
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {items.map((item: any) => {
            const consumo = item.consumo;
            const pct = consumo?.progresso_pct ?? 0;
            const isDone = consumo?.concluido ?? false;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPlaying(item)}
                className="tap text-left"
              >
                <Card
                  variant="surface-sm"
                  className={cn('flex items-center gap-3 p-3', isDone && 'opacity-70')}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                      isDone ? 'bg-em' : 'bg-gp',
                    )}
                  >
                    <Icon
                      name={isDone ? 'check' : TIPO_ICON[item.tipo] ?? 'description'}
                      filled
                      className="!text-[16px] text-white"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{item.titulo}</span>
                      {item.obrigatorio && (
                        <span className="shrink-0 rounded-chip bg-rb/20 px-1.5 py-0.5 text-[8px] font-bold text-rb">
                          OBRIGATÓRIO
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-on-3 capitalize">{item.tipo.replace('_', ' ')}</div>
                    {pct > 0 && pct < 100 && (
                      <ProgressBar value={pct} size="xs" fillClassName="bg-am" className="mt-1" />
                    )}
                  </div>
                  <Icon name="chevron_right" className="!text-[14px] text-on-3" />
                </Card>
              </button>
            );
          })}
        </div>
      </section>

      <Modal open={!!playing} onClose={() => setPlaying(null)} title={playing?.titulo ?? ''} maxWidth="500px">
        {playing && (
          <ConhecimentoPlayer
            item={playing}
            initialProgress={playing.consumo ?? undefined}
            onClose={() => setPlaying(null)}
          />
        )}
      </Modal>
    </>
  );
}
