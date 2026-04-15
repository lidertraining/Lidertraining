import { useEffect } from 'react';
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

  const query = useQuery<FeedEvent[]>({
    queryKey: ['feed', uid, limit],
    enabled: !!uid,
    queryFn: () => listFeed(limit),
  });

  useEffect(() => {
    if (!uid) return;
    const ch = supabase
      .channel(`feed:${uid}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'feed_events' },
        () => {
          qc.invalidateQueries({ queryKey: ['feed'] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [uid, qc]);

  return query;
}
