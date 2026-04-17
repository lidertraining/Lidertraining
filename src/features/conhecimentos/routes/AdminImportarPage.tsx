import { useState } from 'react';
import { supabase } from '@lib/supabase';
import { uploadConhecimento } from '../api/storage';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { Textarea } from '@shared/ui/Textarea';
import { useToast } from '@shared/hooks/useToast';
import { useProfile } from '@shared/hooks/useProfile';
import { cn } from '@lib/cn';

type Tipo = 'audio' | 'video' | 'report' | 'mapa_mental' | 'flashcards' | 'quiz';

const TIPOS: { id: Tipo; label: string; icon: string }[] = [
  { id: 'audio', label: 'Áudio', icon: 'headphones' },
  { id: 'video', label: 'Vídeo', icon: 'videocam' },
  { id: 'report', label: 'Report', icon: 'description' },
  { id: 'mapa_mental', label: 'Mapa Mental', icon: 'account_tree' },
  { id: 'flashcards', label: 'Flashcards', icon: 'style' },
  { id: 'quiz', label: 'Quiz', icon: 'quiz' },
];

export function AdminImportarPage() {
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const [tipo, setTipo] = useState<Tipo>('audio');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('geral');
  const [passo, setPasso] = useState<number | ''>('');
  const [obrigatorio, setObrigatorio] = useState(false);
  const [xp, setXp] = useState(20);
  const [conteudoTexto, setConteudoTexto] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const needsFile = ['audio', 'video', 'mapa_mental'].includes(tipo);
  const needsText = ['report', 'flashcards', 'quiz'].includes(tipo);

  const reset = () => {
    setTitulo('');
    setDescricao('');
    setConteudoTexto('');
    setFile(null);
    setPasso('');
  };

  const save = async () => {
    if (!titulo.trim()) { toast('Título obrigatório', 'error'); return; }
    setSaving(true);
    try {
      let arquivoPath: string | null = null;
      if (file) arquivoPath = await uploadConhecimento(file, tipo);

      const { data, error } = await supabase.from('conhecimentos').insert({
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        categoria,
        passo_jornada: passo === '' ? null : passo,
        obrigatorio,
        xp_reward: xp,
        conteudo_texto: conteudoTexto.trim() || null,
        arquivo_path: arquivoPath,
        criado_por: profile?.id ?? null,
      }).select('id').single();
      if (error) throw error;

      if (tipo === 'flashcards' && conteudoTexto.trim()) {
        const lines = conteudoTexto.split('\n').filter((l) => l.includes('|'));
        const cards = lines.map((line, i) => {
          const [frente, verso] = line.split('|').map((s) => s.trim());
          return { conhecimento_id: data.id, frente: frente ?? '', verso: verso ?? '', ordem: i };
        });
        if (cards.length > 0) await supabase.from('flashcards').insert(cards);
      }

      if (tipo === 'quiz' && conteudoTexto.trim()) {
        try {
          const perguntas = JSON.parse(conteudoTexto) as Array<{
            pergunta: string; alternativas: string[]; resposta_correta: number; explicacao?: string;
          }>;
          const rows = perguntas.map((p, i) => ({
            conhecimento_id: data.id, pergunta: p.pergunta,
            alternativas: JSON.stringify(p.alternativas),
            resposta_correta: p.resposta_correta, explicacao: p.explicacao ?? null, ordem: i,
          }));
          if (rows.length > 0) await supabase.from('quiz_perguntas').insert(rows);
        } catch { /* JSON inválido */ }
      }

      toast('Conhecimento publicado!', 'success', 'check_circle');
      reset();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 pt-2">
      <header>
        <div className="text-sm text-on-3">Administração</div>
        <h1 className="serif text-3xl font-bold">Importar Conhecimento</h1>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {TIPOS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTipo(t.id)}
            className={cn('tap flex flex-col items-center gap-1 rounded-card p-3 text-[11px] font-semibold transition',
              tipo === t.id ? 'bg-am text-sf-void' : 'bg-sf-top text-on-3')}>
            <Icon name={t.icon} filled className="!text-[20px]" />
            {t.label}
          </button>
        ))}
      </div>

      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <Input placeholder="Título *" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <Input placeholder="Descrição (opcional)" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="geral">Geral</option>
            <option value="audio_semana">Áudio da Semana</option>
            <option value="grupo">Grupo</option>
            <option value="microlearning">Microlearning</option>
            <option value="formacao">Formação</option>
          </Select>
          <Select value={passo === '' ? '' : String(passo)} onChange={(e) => setPasso(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">Sem passo</option>
            {Array.from({ length: 11 }, (_, i) => <option key={i} value={i}>Passo {i + 1}</option>)}
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={obrigatorio} onChange={(e) => setObrigatorio(e.target.checked)} className="accent-am" /> Obrigatório
          </label>
          <label className="flex items-center gap-2 text-sm">
            XP: <Input type="number" value={xp} onChange={(e) => setXp(Number(e.target.value))} className="!w-20" />
          </label>
        </div>
        {needsFile && (
          <label className="tap flex items-center gap-2 rounded-card bg-sf-top p-3 text-sm text-on-2 cursor-pointer">
            <Icon name="upload_file" className="!text-[18px] text-am" />
            {file ? file.name : 'Selecionar arquivo'}
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        )}
        {needsText && (
          <div>
            <div className="mb-1 text-[10px] text-on-3">
              {tipo === 'report' && 'Cole o texto em Markdown'}
              {tipo === 'flashcards' && 'Uma por linha: frente | verso'}
              {tipo === 'quiz' && 'JSON: [{"pergunta":"...","alternativas":["a","b","c","d"],"resposta_correta":0,"explicacao":"..."}]'}
            </div>
            <Textarea value={conteudoTexto} onChange={(e) => setConteudoTexto(e.target.value)} rows={8} />
          </div>
        )}
        <Button variant="ge" fullWidth disabled={saving || !titulo.trim()} onClick={save}>
          {saving ? 'Publicando…' : 'Publicar conhecimento'}
        </Button>
      </Card>
    </div>
  );
}
