import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { Textarea } from '@shared/ui/Textarea';
import { useToast } from '@shared/hooks/useToast';
import { useProfile } from '@shared/hooks/useProfile';
import { supabase } from '@lib/supabase';
import { cn } from '@lib/cn';

interface Props {
  dados: Record<string, unknown>;
  setDados: (d: Record<string, unknown>) => void;
}

/* ═══════════════════════════════════════════════════════════════════
 * Web Speech API (transcrição on-device, gratuita, pt-BR)
 * ═══════════════════════════════════════════════════════════════════ */
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/* ═══════════════════════════════════════════════════════════════════
 * Prompt template — incorpora a transcrição do usuário em uma
 * descrição cinematográfica única e instrui o GPT a gerar a imagem
 * ═══════════════════════════════════════════════════════════════════ */
function buildPrompt(transcricao: string): string {
  const limpo = transcricao.trim().replace(/\s+/g, ' ');
  return [
    'Por favor, gere UMA imagem única e cinematográfica que represente visualmente o sonho descrito a seguir, unindo todos os elementos numa cena coerente (não faça collage de imagens separadas).',
    '',
    `Sonho descrito pelo usuário: "${limpo}"`,
    '',
    'Especificações da imagem:',
    '- Estilo: fotorrealista, cinematográfico, qualidade editorial',
    '- Iluminação: dourada, golden hour, dramática e luxuosa',
    '- Paleta: tons quentes premium (dourado #f0c75e, ametista #c9a0ff, branco perolado)',
    '- Atmosfera: aspiracional, emocionante, vida realizada',
    '- Composição: paisagem 16:9, ponto de vista convidativo',
    '- Sem texto, sem marcas d\'água, sem logos',
    '',
    'Una todos os elementos descritos numa ÚNICA cena coesa que faça o sonho parecer real. Gere a imagem agora.',
  ].join('\n');
}

/* ═══════════════════════════════════════════════════════════════════ */
export function SonhoVisualizador({ dados, setDados }: Props) {
  const { toast } = useToast();
  const { data: profile } = useProfile();

  const transcricaoSalva = (dados.sonhoTranscricao as string) ?? '';
  const imagemUrl = (dados.sonhoImagem as string) ?? '';

  const [transcricao, setTranscricao] = useState(transcricaoSalva);
  const [gravando, setGravando] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const speechSupported = !!getSpeechRecognition();

  // Sincroniza transcrição com dados quando o usuário edita ou grava
  useEffect(() => {
    if (transcricao !== transcricaoSalva) {
      setDados({ ...dados, sonhoTranscricao: transcricao });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcricao]);

  const iniciarGravacao = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      toast('Seu navegador não suporta gravação de voz. Use Chrome ou Safari.', 'error');
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'pt-BR';

    let textoFinal = transcricao;

    rec.onresult = (e) => {
      let parcial = '';
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (!r) continue;
        if (r.isFinal) {
          textoFinal += (textoFinal ? ' ' : '') + r[0].transcript.trim();
        } else {
          parcial += r[0].transcript;
        }
      }
      setTranscricao((textoFinal + (parcial ? ' ' + parcial : '')).trim());
    };

    rec.onerror = (e) => {
      if (e.error === 'no-speech') return;
      toast(`Erro na gravação: ${e.error}`, 'error');
      setGravando(false);
    };

    rec.onend = () => setGravando(false);

    recognitionRef.current = rec;
    rec.start();
    setGravando(true);
  }, [transcricao, toast]);

  const pararGravacao = useCallback(() => {
    recognitionRef.current?.stop();
    setGravando(false);
  }, []);

  // Limpa o reconhecedor ao desmontar
  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
    };
  }, []);

  const promptGpt = transcricao ? buildPrompt(transcricao) : '';

  const abrirChatGpt = useCallback(() => {
    if (!promptGpt) {
      toast('Grave ou digite seu sonho primeiro.', 'error');
      return;
    }
    const url = `https://chatgpt.com/?q=${encodeURIComponent(promptGpt)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [promptGpt, toast]);

  const copiarPrompt = useCallback(async () => {
    if (!promptGpt) return;
    try {
      await navigator.clipboard.writeText(promptGpt);
      toast('Prompt copiado! Cole no ChatGPT ou em qualquer IA.', 'success', 'content_copy');
    } catch {
      toast('Não foi possível copiar.', 'error');
    }
  }, [promptGpt, toast]);

  const onUploadImagem = useCallback(async (file: File) => {
    if (!profile?.id) {
      toast('Precisa estar logado.', 'error');
      return;
    }
    setEnviandoImagem(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const path = `${profile.id}/sonho-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('sonhos')
        .upload(path, file, { upsert: false, cacheControl: '3600' });
      if (upErr) throw upErr;

      const { data: urlData } = supabase.storage.from('sonhos').getPublicUrl(path);
      const url = urlData.publicUrl;

      setDados({ ...dados, sonhoImagem: url, sonhoImagemPath: path });
      toast('Imagem do seu sonho anexada!', 'success', 'celebration');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao enviar imagem', 'error');
    } finally {
      setEnviandoImagem(false);
    }
  }, [profile?.id, dados, setDados, toast]);

  const removerImagem = useCallback(() => {
    setDados({ ...dados, sonhoImagem: '', sonhoImagemPath: '' });
  }, [dados, setDados]);

  return (
    <Card variant="surface" className="flex flex-col gap-4 p-5" glow="am">
      <div className="flex items-center gap-2">
        <Icon name="auto_awesome" filled className="!text-[20px] text-am" />
        <div className="serif text-base font-bold">Visualize seu sonho</div>
      </div>
      <p className="text-[12px] text-on-3">
        Fale o que você quer realizar (carro, casa, viagens…). A gente transforma em uma imagem única do seu futuro.
      </p>

      {/* Etapa 1: Gravação ou texto */}
      <div className="flex flex-col gap-2">
        <div className="text-[10px] font-bold uppercase tracking-[.15em] text-am">
          1. Conte seu sonho
        </div>
        <div className="flex flex-col gap-2">
          {speechSupported && (
            <Button
              type="button"
              variant={gravando ? 'gr' : 'ge'}
              fullWidth
              onClick={gravando ? pararGravacao : iniciarGravacao}
              leftIcon={
                <Icon name={gravando ? 'stop_circle' : 'mic'} filled className="!text-[18px]" />
              }
            >
              {gravando ? 'Parar gravação' : 'Falar meu sonho'}
            </Button>
          )}
          <Textarea
            value={transcricao}
            onChange={(e) => setTranscricao(e.target.value)}
            rows={4}
            placeholder={
              speechSupported
                ? 'Toque o botão acima e fale, ou escreva aqui mesmo…'
                : 'Descreva seu sonho aqui (texto) — seu navegador não suporta gravação por voz.'
            }
            className={cn(gravando && 'ring-1 ring-am')}
          />
          {gravando && (
            <div className="flex items-center gap-2 text-[11px] text-am">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-am" />
              Estou ouvindo…
            </div>
          )}
        </div>
      </div>

      {/* Etapa 2: Gerar no ChatGPT */}
      {transcricao.trim().length > 5 && (
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold uppercase tracking-[.15em] text-am">
            2. Gerar a imagem no ChatGPT
          </div>
          <p className="text-[11px] text-on-3">
            Vamos abrir o ChatGPT com o prompt já pronto. Você loga (Google funciona), clica enviar e ele desenha.
            Depois baixa a imagem e volta pra anexar aqui.
          </p>
          <Button
            type="button"
            variant="ge"
            fullWidth
            onClick={abrirChatGpt}
            leftIcon={<Icon name="palette" filled className="!text-[18px]" />}
          >
            Abrir no ChatGPT
          </Button>
          <button
            type="button"
            onClick={copiarPrompt}
            className="text-[11px] text-on-3 hover:text-am underline-offset-2 hover:underline"
          >
            Copiar prompt (pra usar em outra IA)
          </button>
        </div>
      )}

      {/* Etapa 3: Anexar imagem */}
      {transcricao.trim().length > 5 && (
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold uppercase tracking-[.15em] text-am">
            3. Anexar a imagem do meu sonho
          </div>

          {imagemUrl ? (
            <div className="flex flex-col gap-2">
              <div className="overflow-hidden rounded-card border border-sf-top">
                <img
                  src={imagemUrl}
                  alt="Visualização do meu sonho"
                  className="block w-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="surface"
                  fullWidth
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Icon name="refresh" className="!text-[16px]" />}
                  disabled={enviandoImagem}
                >
                  Trocar imagem
                </Button>
                <Button
                  type="button"
                  variant="surface"
                  onClick={removerImagem}
                  leftIcon={<Icon name="delete" className="!text-[16px] text-rb" />}
                  disabled={enviandoImagem}
                >
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="surface"
              fullWidth
              onClick={() => fileInputRef.current?.click()}
              leftIcon={<Icon name="upload_file" filled className="!text-[18px]" />}
              disabled={enviandoImagem}
            >
              {enviandoImagem ? 'Enviando…' : 'Enviar imagem do meu sonho'}
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUploadImagem(f);
              e.target.value = '';
            }}
          />
        </div>
      )}
    </Card>
  );
}
