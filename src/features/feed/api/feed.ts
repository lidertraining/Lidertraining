import { supabase } from '@lib/supabase';
import { unescapeUnicode } from '@lib/unescape';
import type { FeedEvent } from '@ltypes/domain';

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapFeedEvent(row: any): FeedEvent {
  return {
    id: row.id,
    userId: row.user_id,
    actorName: unescapeUnicode(row.actor_name),
    action: unescapeUnicode(row.action),
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
