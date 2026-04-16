import { useState } from 'react';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { formatAudioLength } from '@lib/format';
import { useAudios, useMarkAudioComplete } from '../hooks/useAudios';
import { AUDIOS } from '@content/audios';
import { cn } from '@lib/cn';

export function AudioList() {
  const { data = [], isLoading } = useAudios();
  const { mutate: complete, isPending } = useMarkAudioComplete();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const done = data.filter((a) => a.completed).length;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="serif text-lg font-bold">Áudios obrigatórios</h2>
        <span className="text-xs text-on-3">
          {done} / {data.length}
        </span>
      </div>
      {isLoading ? (
        <div className="py-6 text-center text-xs text-on-3">Carregando…</div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((a) => {
            const meta = AUDIOS.find((x) => x.id === a.id);
            const expanded = expandedId === a.id;
            const hasContent = !!(meta?.description || meta?.keyPoints?.length);

            return (
              <Card
                key={a.id}
                variant="surface-sm"
                className={cn('flex flex-col gap-3 p-3', a.completed && 'opacity-80')}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      a.completed ? 'bg-em' : 'bg-gp',
                    )}
                  >
                    <Icon
                      name={a.completed ? 'check' : 'play_arrow'}
                      filled
                      className="!text-[20px] text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => (hasContent ? setExpandedId(expanded ? null : a.id) : undefined)}
                    className="flex flex-1 flex-col text-left"
                  >
                    <div className="text-sm font-semibold">{a.title}</div>
                    <div className="text-[11px] text-on-3">
                      {formatAudioLength(a.durationSeconds)}
                    </div>
                  </button>
                  {hasContent && (
                    <Icon
                      name={expanded ? 'expand_less' : 'expand_more'}
                      className="!text-[18px] text-on-3"
                    />
                  )}
                  {!a.completed && (
                    <button
                      onClick={() => complete({ audioId: a.id, title: a.title })}
                      disabled={isPending}
                      className="tap rounded-chip bg-am-darker/30 px-3 py-1 text-[11px] font-semibold text-am"
                    >
                      +25 XP
                    </button>
                  )}
                </div>

                {expanded && hasContent && (
                  <div className="flex flex-col gap-2 border-t border-sf-top/40 pt-3">
                    {meta?.description && (
                      <p className="text-[12px] text-on-2">{meta.description}</p>
                    )}
                    {meta?.keyPoints && meta.keyPoints.length > 0 && (
                      <div>
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-on-3">
                          Principais pontos
                        </div>
                        <ul className="flex flex-col gap-1">
                          {meta.keyPoints.map((kp, i) => (
                            <li key={i} className="flex items-start gap-2 text-[11px] text-on-2">
                              <span className="mt-0.5 text-am">•</span>
                              <span>{kp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
