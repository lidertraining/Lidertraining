import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';
import { useAddXP } from '@features/gamification/hooks/useAddXP';
import { useToast } from '@shared/hooks/useToast';
import { AudioPlayer } from './AudioPlayer';
import { FlashcardDeck } from './FlashcardDeck';
import { QuizRunner } from './QuizRunner';
import { Markdown } from '@shared/ui/Markdown';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { getSignedUrl } from '../api/storage';

export interface Conhecimento {
  id: string;
  tipo: 'audio' | 'video' | 'report' | 'mapa_mental' | 'flashcards' | 'quiz';
  titulo: string;
  descricao: string | null;
  conteudo_texto: string | null;
  arquivo_path: string | null;
  xp_reward: number;
  duracao_segundos: number | null;
}

interface ConhecimentoPlayerProps {
  item: Conhecimento;
  initialProgress?: { posicao_segundos: number; progresso_pct: number; concluido: boolean };
  onClose?: () => void;
}

export function ConhecimentoPlayer({ item, initialProgress, onClose }: ConhecimentoPlayerProps) {
  const { mutate: addXP } = useAddXP();
  const { toast } = useToast();
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [completed, setCompleted] = useState(initialProgress?.concluido ?? false);

  useEffect(() => {
    if (item.arquivo_path && (item.tipo === 'audio' || item.tipo === 'video' || item.tipo === 'mapa_mental')) {
      getSignedUrl(item.arquivo_path).then(setMediaUrl);
    }
  }, [item.arquivo_path, item.tipo]);

  const saveProgress = useCallback(
    async (position: number, pct: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('conhecimento_consumo').upsert(
        {
          user_id: user.id,
          conhecimento_id: item.id,
          posicao_segundos: Math.floor(position),
          progresso_pct: Math.floor(pct),
          concluido: pct >= 95,
          concluido_at: pct >= 95 ? new Date().toISOString() : null,
        },
        { onConflict: 'user_id,conhecimento_id' },
      );
    },
    [item.id],
  );

  const markComplete = useCallback(() => {
    if (completed) return;
    setCompleted(true);
    addXP({ amount: item.xp_reward, reason: item.titulo });
    toast(`Concluído! +${item.xp_reward} XP`, 'xp', 'check_circle');
    saveProgress(0, 100);
  }, [completed, addXP, item, toast, saveProgress]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onClose && (
          <button onClick={onClose} className="tap text-on-3">
            <Icon name="close" className="!text-[22px]" />
          </button>
        )}
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-am">
            {TYPE_LABELS[item.tipo]}
          </div>
          <h2 className="serif text-xl font-bold">{item.titulo}</h2>
        </div>
        {completed && (
          <div className="flex items-center gap-1 rounded-chip bg-em/20 px-2 py-1 text-[10px] font-bold text-em">
            <Icon name="check_circle" filled className="!text-[12px]" />
            Concluído
          </div>
        )}
      </div>

      {item.descricao && (
        <p className="text-sm text-on-2">{item.descricao}</p>
      )}

      {/* Renderiza por tipo */}
      {item.tipo === 'audio' && mediaUrl && (
        <AudioPlayer
          src={mediaUrl}
          title={item.titulo}
          initialPosition={initialProgress?.posicao_segundos ?? 0}
          onProgress={saveProgress}
          onComplete={markComplete}
        />
      )}

      {item.tipo === 'video' && mediaUrl && (
        <Card variant="surface" className="overflow-hidden rounded-card p-0">
          <video
            src={mediaUrl}
            controls
            className="w-full"
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration > 0) {
                const p = (v.currentTime / v.duration) * 100;
                if (Math.floor(v.currentTime) % 5 === 0) saveProgress(v.currentTime, p);
                if (p >= 95 && !completed) markComplete();
              }
            }}
          />
        </Card>
      )}

      {item.tipo === 'report' && item.conteudo_texto && (
        <Card variant="surface-sm" className="p-5">
          <Markdown source={item.conteudo_texto} />
          {!completed && (
            <button
              onClick={markComplete}
              className="tap mt-4 w-full rounded-card bg-gp py-3 text-sm font-bold text-white"
            >
              Marquei como lido · +{item.xp_reward} XP
            </button>
          )}
        </Card>
      )}

      {item.tipo === 'mapa_mental' && mediaUrl && (
        <Card variant="surface-sm" className="p-2">
          <img
            src={mediaUrl}
            alt={item.titulo}
            className="w-full rounded-card"
            onLoad={() => { if (!completed) markComplete(); }}
          />
        </Card>
      )}

      {item.tipo === 'flashcards' && (
        <FlashcardDeck
          conhecimentoId={item.id}
          onComplete={markComplete}
        />
      )}

      {item.tipo === 'quiz' && (
        <QuizRunner
          conhecimentoId={item.id}
          xpReward={item.xp_reward}
          onComplete={markComplete}
        />
      )}
    </div>
  );
}

const TYPE_LABELS: Record<Conhecimento['tipo'], string> = {
  audio: 'Áudio',
  video: 'Vídeo',
  report: 'Report',
  mapa_mental: 'Mapa Mental',
  flashcards: 'Flashcards',
  quiz: 'Quiz',
};
