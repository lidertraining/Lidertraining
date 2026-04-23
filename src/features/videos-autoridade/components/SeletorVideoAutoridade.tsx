import { useState } from 'react';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { Modal } from '@shared/ui/Modal';
import { EmptyState } from '@shared/ui/EmptyState';
import { useProfile } from '@shared/hooks/useProfile';
import { useToast } from '@shared/hooks/useToast';
import { useVideosAutoridade, useContextosVideo } from '../hooks/useVideosAutoridade';
import { registrarEnvio, type VideoAutoridade } from '../api/videosAutoridade';
import { buildWaURL } from '@lib/phone';
import { cn } from '@lib/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  leadId?: string | null;
  leadNome?: string;
  leadPhone?: string | null;
}

export function SeletorVideoAutoridade({ open, onClose, leadId, leadNome, leadPhone }: Props) {
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const { data: contextos = [] } = useContextosVideo();
  const [filtroContexto, setFiltroContexto] = useState<string | null>(null);
  const { data: videos = [], isLoading } = useVideosAutoridade(
    filtroContexto ? { contexto: filtroContexto } : undefined,
  );

  const contextoEscolhido = contextos.find((c) => c.id === filtroContexto);

  const enviar = async (video: VideoAutoridade) => {
    if (!profile?.id) return;

    // Template mensagem
    const template = video.mensagens_templates.find((m) => m.contexto === filtroContexto)
      ?? video.mensagens_templates[0];

    const nome = leadNome?.split(' ')[0] ?? '';
    const mensagem = template
      ? template.texto.replace(/\{NOME\}/g, nome).replace(/\{URL\}/g, video.url_original)
      : `Oi ${nome}! Achei esse vídeo muito alinhado com o que a gente tava conversando:\n\n${video.titulo}\n${video.url_original}`;

    // Registra envio
    try {
      await registrarEnvio({
        video_id: video.id,
        consultor_id: profile.id,
        lead_id: leadId ?? null,
        contexto: filtroContexto ?? undefined,
        mensagem_usada: mensagem,
      });
    } catch {
      /* não crítico */
    }

    // Abre WhatsApp
    if (leadPhone) {
      window.open(buildWaURL(leadPhone, mensagem) ?? undefined, '_blank');
    } else {
      try {
        await navigator.clipboard.writeText(mensagem);
        toast('Mensagem copiada — cole no WhatsApp', 'success', 'content_copy');
      } catch {
        toast('Envie essa mensagem manualmente', 'info');
      }
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Enviar vídeo de autoridade" maxWidth="500px">
      <div className="flex flex-col gap-3">
        {/* Filtro por contexto */}
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-on-3">
            Por que você está enviando?
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setFiltroContexto(null)}
              className={cn(
                'rounded-chip px-2 py-1 text-[10px] font-semibold',
                !filtroContexto ? 'bg-am text-sf-void' : 'bg-sf-top text-on-3',
              )}
            >
              Todos
            </button>
            {contextos.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFiltroContexto(c.id)}
                className={cn(
                  'rounded-chip px-2 py-1 text-[10px] font-semibold',
                  filtroContexto === c.id ? 'bg-am text-sf-void' : 'bg-sf-top text-on-3',
                )}
              >
                {c.nome}
              </button>
            ))}
          </div>
          {contextoEscolhido?.descricao && (
            <div className="mt-2 rounded-card bg-am/5 px-3 py-2 text-[10px] italic text-am">
              {contextoEscolhido.descricao}
            </div>
          )}
        </div>

        {/* Lista de vídeos */}
        {isLoading ? (
          <div className="py-8 text-center text-sm text-on-3">Buscando vídeos…</div>
        ) : videos.length === 0 ? (
          <EmptyState
            icon="movie"
            title={filtroContexto ? 'Sem vídeo nesse contexto' : 'Biblioteca vazia'}
            description={filtroContexto ? 'Tente outro contexto ou veja "Todos".' : 'Peça ao admin pra publicar vídeos.'}
          />
        ) : (
          <div className="flex flex-col gap-2">
            {videos.map((v) => (
              <Card key={v.id} variant="surface-sm" className="flex flex-col gap-2 p-3">
                <div className="flex gap-3">
                  {v.thumbnail_url && (
                    <img src={v.thumbnail_url} alt="" className="h-14 w-20 shrink-0 rounded-card-sm object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-semibold">{v.titulo}</div>
                    <div className="text-[10px] text-on-3">
                      {v.autoridade_nome} · {v.plataforma}
                    </div>
                    {v.descricao_curta && (
                      <div className="mt-1 line-clamp-2 text-[11px] text-on-2">{v.descricao_curta}</div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={v.url_original}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap flex flex-1 items-center justify-center gap-1 rounded-card bg-sf-top px-3 py-2 text-[11px] font-semibold text-on-2"
                  >
                    <Icon name="play_circle" filled className="!text-[14px]" />
                    Assistir
                  </a>
                  <Button
                    size="sm"
                    variant="ge"
                    className="flex-1"
                    onClick={() => enviar(v)}
                    leftIcon={<Icon name="chat" filled className="!text-[14px]" />}
                  >
                    {leadPhone ? 'WhatsApp' : 'Copiar msg'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
