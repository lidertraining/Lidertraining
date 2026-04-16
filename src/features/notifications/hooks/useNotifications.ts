import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { useAuth } from '@shared/hooks/useAuth';
import { listNotifications } from '../api/notifications';
import type { Notification } from '@ltypes/domain';

/** Query + assinatura realtime das notificações do usuário. */
export function useNotifications() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const uid = session?.user.id;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const query = useQuery<Notification[]>({
    queryKey: ['notifications', uid],
    enabled: !!uid,
    queryFn: () => (uid ? listNotifications(uid) : Promise.resolve([])),
  });

  useEffect(() => {
    if (!uid) return;

    // Canal com ID único evita conflito no StrictMode (duplo mount)
    try {
      const ch = supabase
        .channel(`notif:${uid}:${Date.now()}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${uid}` },
          () => {
            qc.invalidateQueries({ queryKey: ['notifications', uid] });
          },
        )
        .subscribe();
      channelRef.current = ch;
    } catch {
      // Realtime não é crítico — app funciona sem ele
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [uid, qc]);

  const unreadCount = query.data?.filter((n) => !n.read).length ?? 0;

  return { ...query, unreadCount };
}
