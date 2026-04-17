import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@lib/supabase';
import { useAuth } from '@shared/hooks/useAuth';
import { listFeed } from '../api/feed';
import type { FeedEvent } from '@ltypes/domain';

/** Feed de eventos (self + downline via RLS). */
export function useFeed(limit = 20) {
  const { session } = useAuth();
  const qc = useQueryClient();
  const uid = session?.user.id;
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const query = useQuery<FeedEvent[]>({
    queryKey: ['feed', uid, limit],
    enabled: !!uid,
    queryFn: () => listFeed(limit),
    // Fallback caso realtime falhe: refetch a cada 60s
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (!uid) return;

    try {
      const ch = supabase
        .channel(`feed:${uid}:${Date.now()}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'feed_events' },
          () => {
            qc.invalidateQueries({ queryKey: ['feed'] });
          },
        )
        .subscribe();
      channelRef.current = ch;
    } catch {
      // Realtime não é crítico
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [uid, qc]);

  return query;
}
