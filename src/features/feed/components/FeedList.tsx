import { useFeed } from '../hooks/useFeed';
import { Icon } from '@shared/ui/Icon';
import { Avatar } from '@shared/ui/Avatar';
import { relativeTime } from '@lib/relativeTime';
import { EmptyState } from '@shared/ui/EmptyState';

interface FeedListProps {
  limit?: number;
}

export function FeedList({ limit = 10 }: FeedListProps) {
  const { data = [], isLoading } = useFeed(limit);

  if (isLoading) {
    return <div className="py-6 text-center text-xs text-on-3">Carregando feed…</div>;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon="dynamic_feed"
        title="Feed vazio"
        description="Conclua missões e seus eventos aparecerão aqui."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {data.map((e) => (
        <div key={e.id} className="surface-sm flex items-center gap-3 p-3">
          <Avatar name={e.actorName} size="sm" />
          <div className="flex-1">
            <div className="text-sm">
              <strong className="text-on">{e.actorName}</strong>{' '}
              <span className="text-on-2">{e.action}</span>
            </div>
            <div className="text-[10px] text-on-3">{relativeTime(e.createdAt)}</div>
          </div>
          <Icon name={e.icon} filled className="!text-[18px] text-am" />
        </div>
      ))}
    </div>
  );
}
