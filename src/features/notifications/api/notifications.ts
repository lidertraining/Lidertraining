import { supabase } from '@lib/supabase';
import type { Notification, NotifType } from '@ltypes/domain';

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as NotifType,
    message: row.message,
    icon: row.icon,
    read: row.read,
    createdAt: row.created_at,
  };
}

export async function listNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []).map(mapNotification);
}

export async function markAllRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
}
