import { useEffect } from 'react';
import { Modal } from '@shared/ui/Modal';
import { Icon } from '@shared/ui/Icon';
import { useNotifications } from '../hooks/useNotifications';
import { markAllRead } from '../api/notifications';
import { useAuth } from '@shared/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@lib/cn';
import { relativeTime } from '@lib/relativeTime';
import { EmptyState } from '@shared/ui/EmptyState';
import type { NotifType } from '@ltypes/domain';

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
}

const ICON_FOR_TYPE: Record<NotifType, string> = {
  streak: 'local_fire_department',
  mission: 'bolt',
  league: 'emoji_events',
  team: 'group',
  nba: 'lightbulb',
  info: 'info',
  xp: 'star',
};

export function NotificationsModal({ open, onClose }: NotificationsModalProps) {
  const { data = [] } = useNotifications();
  const { session } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!open || !session) return;
    const hasUnread = data.some((n) => !n.read);
    if (!hasUnread) return;
    markAllRead(session.user.id)
      .then(() => qc.invalidateQueries({ queryKey: ['notifications'] }))
      .catch(() => {});
  }, [open, data, session, qc]);

  return (
    <Modal open={open} onClose={onClose} title="Notificações" maxWidth="380px">
      {data.length === 0 ? (
        <EmptyState
          icon="notifications_off"
          title="Nenhuma notifica\u00e7\u00e3o"
          description="Voc\u00ea est\u00e1 em dia. Continue o bom trabalho!"
        />
      ) : (
        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
          {data.map((n) => (
            <div
              key={n.id}
              className={cn(
                'flex items-start gap-3 rounded-card-sm p-3',
                n.read ? 'bg-sf-low' : 'bg-sf-hi',
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-am-darker/30">
                <Icon
                  name={n.icon ?? ICON_FOR_TYPE[n.type]}
                  filled
                  className="!text-[16px] text-am"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm">{n.message}</div>
                <div className="mt-1 text-[10px] text-on-3">{relativeTime(n.createdAt)}</div>
              </div>
              {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-am" />}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
