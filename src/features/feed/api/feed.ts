import { supabase } from '@lib/supabase';
import type { FeedEvent } from '@types/domain';

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapFeedEvent(row: any): FeedEvent {
  return {
    id: row.id,
    userId: row.user_id,
    actorName: row.actor_name,
    action: row.action,
    icon: row.icon,
    createdAt: row.created_at,
  };
}

export async function listFeed(limit = 20): Promise<FeedEvent[]> {
  const { data, error } = await supabase
    .from('feed_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapFeedEvent);
}
