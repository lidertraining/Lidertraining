import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { Textarea } from '@shared/ui/Textarea';
import { useToast } from '@shared/hooks/useToast';
import { useProfile } from '@shared/hooks/useProfile';
import {
  useAutoridades,
  useContextosVideo,
  useVideosAutoridadeAdmin,
} from '../hooks/useVideosAutoridade';
import {
  criarVideo,
  atualizarVideo,
  detectarPlataforma,
  thumbnailPorURL,
} from '../api/videosAutoridade';
import { cn } from '@lib/cn';

export function AdminVideosAutoridadePage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { data: autoridades = [] } = useAutoridades();
  const { data: contextos = [] } = useContextosVideo();
  const { data: videos = [] } = useVideosAutoridadeAdmin();

  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [autoridadeId, setAutoridadeId] = useState('');
  const [contextosSelecionados, setContextosSelecionados] = useState<string[]>([]);
  const [intensidade, setIntensidade] = useState(3);
  const [mensagem, setMensagem] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleContexto = (id: string) => {
    setContextosSelecionados((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const reset = () => {
    setUrl('');
    setTitulo('');
    setDescricao('');
    setAutoridadeId('');
    setContextosSelecionados([]);
    setIntensidade(3);
    setMensagem('');
  };

  const publicar = async () => {
    if (!url.trim() || !titulo.trim() || !autoridadeId) {
      toast('URL, título e autoridade são obrigatórios', 'error');
      return;
    }
    setSaving(true);
    try {
      await criarVideo({
        autoridade_id: autoridadeId,
        plataforma: detectarPlataforma(url),
        url_original: url.trim(),
        titulo: titulo.trim(),
        descricao_curta: descricao.trim() || null,
        thumbnail_url: thumbnailPorURL(url) ?? undefined,
        contextos: contextosSelecionados,
        intensidade,
        mensagens_templates: mensagem.trim()
          ? [{ contexto: contextosSelecionados[0] ?? 'mentalidade_geral', texto: mensagem.trim() }]
          : [],
        status: 'publicado',
        criado_por: profile?.id ?? null,
      });
      await qc.invalidateQueries({ queryKey: ['videos_autoridade'] });
      toast('Vídeo publicado!', 'success', 'check_circle');
      reset();
      setShowForm(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao publicar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const arquivar = async (id: string) => {
    await atualizarVideo(id, { status: 'arquivado' });
    qc.invalidateQueries({ queryKey: ['videos_autoridade'] });
  };

  const thumb = thumbnailPorURL(url);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <header>
        <div className="text-sm text-on-3">Administração</div>
        <h1 className="serif text-3xl font-bold">Vídeos de Autoridade</h1>
        <p className="mt-1 text-[11px] text-on-3">
          Curadoria de vídeos externos (YouTube/IG/TikTok) para enviar a leads.
          Sistema apenas compartilha links — nada é hospedado aqui.
        </p>
      </header>

      {!showForm ? (
        <Button
          variant="ge"
          fullWidth
          onClick={() => setShowForm(true)}
          leftIcon={<Icon name="add" className="!text-[18px]" />}
        >
          Adicionar vídeo
        </Button>
      ) : (
        <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Novo vídeo</div>
            <button onClick={() => { setShowForm(false); reset(); }} className="tap text-on-3">
              <Icon name="close" className="!text-[18px]" />
            </button>
          </div>

          <Input
            placeholder="URL (YouTube, Instagram, TikTok) *"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {thumb && (
            <img src={thumb} alt="preview" className="h-32 w-full rounded-card object-cover" />
          )}

          <Input
            placeholder="Título do vídeo *"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <Textarea
            placeholder="Descrição curta"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={2}
          />

          <Select
            value={autoridadeId}
            onChange={(e) => setAutoridadeId(e.target.value)}
          >
            <option value="">Escolha a autoridade *</option>
            {autoridades.map((a) => (
              <option key={a.id} value={a.id}>{a.nome}</option>
            ))}
          </Select>

          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-on-3">
              Contextos (onde esse vídeo se encaixa)
            </div>
            <div className="flex flex-wrap gap-1">
              {contextos.map((c) => {
                const selected = contextosSelecionados.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleContexto(c.id)}
                    className={cn(
                      'rounded-chip px-2 py-1 text-[10px] font-semibold transition',
                      selected ? 'bg-am text-sf-void' : 'bg-sf-top text-on-3',
                    )}
                  >
                    {c.nome}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="text-on-3">Intensidade</span>
              <span className="font-bold text-am">{intensidade}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={intensidade}
              onChange={(e) => setIntensidade(Number(e.target.value))}
              className="h-1.5 w-full appearance-none rounded-full bg-sf-top accent-am"
            />
          </div>

          <Textarea
            placeholder="Mensagem sugerida (use {NOME} e {URL})"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            rows={3}
          />

          <Button
            variant="ge"
            fullWidth
            disabled={saving || !url.trim() || !titulo.trim() || !autoridadeId}
            onClick={publicar}
          >
            {saving ? 'Publicando…' : 'Publicar vídeo'}
          </Button>
        </Card>
      )}

      {/* Lista de vídeos existentes */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold">Biblioteca ({videos.length})</h2>
        {videos.length === 0 ? (
          <p className="text-[11px] text-on-3">Nenhum vídeo cadastrado ainda.</p>
        ) : (
          videos.map((v) => (
            <Card key={v.id} variant="surface-sm" className="flex gap-3 p-3">
              {v.thumbnail_url && (
                <img src={v.thumbnail_url} alt="" className="h-16 w-24 shrink-0 rounded-card-sm object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">{v.titulo}</span>
                  <span className={cn(
                    'rounded-chip px-1.5 py-0.5 text-[8px] font-bold',
                    v.status === 'publicado' ? 'bg-em/20 text-em' :
                    v.status === 'rascunho' ? 'bg-or/20 text-or' : 'bg-sf-top text-on-3',
                  )}>
                    {v.status}
                  </span>
                </div>
                <div className="text-[10px] text-on-3">
                  {v.autoridade_nome} · {v.plataforma} · {v.contextos.length} contexto(s) · {v.total_envios ?? 0} envio(s)
                </div>
              </div>
              {v.status !== 'arquivado' && (
                <button
                  onClick={() => arquivar(v.id)}
                  className="tap text-on-3"
                  title="Arquivar"
                >
                  <Icon name="archive" className="!text-[16px]" />
                </button>
              )}
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
