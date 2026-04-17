import { useState } from 'react';
import { useConhecimentos } from '../hooks/useConhecimentos';
import { ConhecimentoPlayer, type Conhecimento } from '../components/ConhecimentoPlayer';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Modal } from '@shared/ui/Modal';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { EmptyState } from '@shared/ui/EmptyState';
import { cn } from '@lib/cn';

function formatDur(s: number | null): string {
  if (!s) return '';
  const m = Math.floor(s / 60);
  return `${m} min`;
}

export function AudiosPage() {
  const { data: all = [], isLoading } = useConhecimentos({ tipo: 'audio' });
  const [playing, setPlaying] = useState<(Conhecimento & { consumo?: { posicao_segundos: number; progresso_pct: number; concluido: boolean } | null }) | null>(null);

  const semana = all.filter((a) => a.categoria === 'audio_semana');
  const grupo = all.filter((a) => a.categoria === 'grupo');
  const micro = all.filter((a) => a.categoria === 'microlearning');
  const geral = all.filter((a) => !['audio_semana', 'grupo', 'microlearning'].includes(a.categoria));

  return (
    <div className="flex flex-col gap-5 pt-2">
      <header className="animate-fade-up">
        <div className="text-sm text-on-3">Central de conteúdo</div>
        <h1 className="serif text-3xl font-bold">Áudios</h1>
      </header>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-on-3">Carregando áudios…</div>
      ) : all.length === 0 ? (
        <EmptyState
          icon="headphones"
          title="Nenhum áudio disponível"
          description="Novos áudios serão publicados pelo seu líder. Volte em breve."
        />
      ) : (
        <>
          {semana.length > 0 && (
            <Section title="Áudio da Semana" icon="star" color="gd" items={semana} onPlay={setPlaying} />
          )}
          {grupo.length > 0 && (
            <Section title="Áudios do Grupo" icon="groups" color="am" items={grupo} onPlay={setPlaying} />
          )}
          {micro.length > 0 && (
            <Section title="Microlearning" icon="bolt" color="or" items={micro} onPlay={setPlaying} />
          )}
          {geral.length > 0 && (
            <Section title="Todos" icon="library_music" color="on-3" items={geral} onPlay={setPlaying} />
          )}
        </>
      )}

      {/* Player modal */}
      <Modal
        open={!!playing}
        onClose={() => setPlaying(null)}
        title={playing?.titulo ?? ''}
        maxWidth="500px"
      >
        {playing && (
          <ConhecimentoPlayer
            item={playing}
            initialProgress={playing.consumo ?? undefined}
            onClose={() => setPlaying(null)}
          />
        )}
      </Modal>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function Section({
  title,
  icon,
  color,
  items,
  onPlay,
}: {
  title: string;
  icon: string;
  color: string;
  items: any[];
  onPlay: (item: any) => void;
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon name={icon} filled className={`!text-[18px] text-${color}`} />
        <h2 className="serif text-base font-bold">{title}</h2>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item: any) => {
          const consumo = item.consumo;
          const pct = consumo?.progresso_pct ?? 0;
          const done = consumo?.concluido ?? false;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPlay(item)}
              className="tap text-left"
            >
              <Card
                variant="surface-sm"
                className={cn('flex items-center gap-3 p-3', done && 'opacity-70')}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    done ? 'bg-em' : 'bg-gp',
                  )}
                >
                  <Icon
                    name={done ? 'check' : 'play_arrow'}
                    filled
                    className="!text-[20px] text-white"
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
                  <div className="text-[11px] text-on-3">
                    {formatDur(item.duracao_segundos)}
                    {pct > 0 && pct < 100 && ` · ${pct}% ouvido`}
                  </div>
                  {pct > 0 && pct < 100 && (
                    <ProgressBar value={pct} size="xs" fillClassName="bg-am" className="mt-1" />
                  )}
                </div>
                <Icon name="chevron_right" className="!text-[16px] text-on-3" />
              </Card>
            </button>
          );
        })}
      </div>
    </section>
  );
}
