import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { formatAudioLength } from '@lib/format';
import { useAudios, useMarkAudioComplete } from '../hooks/useAudios';
import { cn } from '@lib/cn';

export function AudioList() {
  const { data = [], isLoading } = useAudios();
  const { mutate: complete, isPending } = useMarkAudioComplete();

  const done = data.filter((a) => a.completed).length;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <h2 className="serif text-lg font-bold">\u00c1udios obrigat\u00f3rios</h2>
        <span className="text-xs text-on-3">
          {done} / {data.length}
        </span>
      </div>
      {isLoading ? (
        <div className="py-6 text-center text-xs text-on-3">Carregando\u2026</div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((a) => (
            <Card
              key={a.id}
              variant="surface-sm"
              className={cn(
                'flex items-center gap-3 p-3',
                a.completed && 'opacity-70',
              )}
            >
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
              <div className="flex-1">
                <div className="text-sm font-semibold">{a.title}</div>
                <div className="text-[11px] text-on-3">
                  {formatAudioLength(a.durationSeconds)}
                </div>
              </div>
              {!a.completed && (
                <button
                  onClick={() => complete({ audioId: a.id, title: a.title })}
                  disabled={isPending}
                  className="tap rounded-chip bg-am-darker/30 px-3 py-1 text-[11px] font-semibold text-am"
                >
                  +25 XP
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
