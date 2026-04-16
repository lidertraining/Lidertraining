import { supabase } from '@lib/supabase';
import { unescapeUnicode } from '@lib/unescape';
import { AUDIOS } from '@content/audios';
import type { AudioTrack } from '@ltypes/content';

export interface AudioWithProgress extends AudioTrack {
  completed: boolean;
}

export async function listAudios(userId: string): Promise<AudioWithProgress[]> {
  const [audiosRes, progressRes] = await Promise.all([
    supabase.from('audios').select('id, title, duration_seconds, url, order_idx').order('order_idx'),
    supabase.from('audio_progress').select('audio_id, completed').eq('user_id', userId),
  ]);

  const audios: AudioTrack[] =
    audiosRes.error || !audiosRes.data || audiosRes.data.length === 0
      ? AUDIOS
      : audiosRes.data.map((r) => ({
          id: r.id,
          title: unescapeUnicode(r.title),
          durationSeconds: r.duration_seconds,
          url: r.url ?? undefined,
        }));

  const completedSet = new Set(
    (progressRes.data ?? []).filter((p) => p.completed).map((p) => p.audio_id),
  );

  return audios.map((a) => ({ ...a, completed: completedSet.has(a.id) }));
}

export async function markAudioComplete(userId: string, audioId: string) {
  const { error } = await supabase.from('audio_progress').upsert(
    {
      user_id: userId,
      audio_id: audioId,
      completed: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,audio_id' },
  );
  if (error) throw error;
}
