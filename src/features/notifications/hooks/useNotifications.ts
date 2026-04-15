import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { useAuth } from '@shared/providers/AuthProvider';
import { listNotifications } from '../api/notifications';
import type { Notification } from '@types/domain';

/** Query + assinatura realtime das notificações do usu\u00e1rio. */
export function useNotifications() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const uid = session?.user.id;

  const query = useQuery<Notification[]>({
    queryKey: ['notifications', uid],
    enabled: !!uid,
    queryFn: () => (uid ? listNotifications(uid) : Promise.resolve([])),
  });

  useEffect(() => {
    if (!uid) return;
    const ch = supabase
      .channel(`notif:${uid}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` },
        () => {
          qc.invalidateQueries({ queryKey: ['notifications', uid] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [uid, qc]);

  const unreadCount = query.data?.filter((n) => !n.read).length ?? 0;

  return { ...query, unreadCount };
}
