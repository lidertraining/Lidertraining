import { supabase } from '@lib/supabase';
import { unescapeRow } from '@lib/unescape';

export interface Autoridade {
  id: string;
  nome: string;
  slug: string;
  especialidade: string | null;
  canal_youtube: string | null;
  instagram: string | null;
  foto_url: string | null;
  ativo: boolean;
  ordem: number;
}

export interface ContextoVideo {
  id: string;
  nome: string;
  descricao: string | null;
  estagio: string;
  ordem: number;
}

export interface VideoAutoridade {
  id: string;
  autoridade_id: string;
  plataforma: 'youtube' | 'instagram' | 'tiktok' | 'outros';
  url_original: string;
  url_externa: string | null;
  titulo: string;
  descricao_curta: string | null;
  duracao_segundos: number | null;
  thumbnail_url: string | null;
  contextos: string[];
  intensidade: number;
  mensagens_templates: Array<{ contexto: string; texto: string }>;
  tags: string[];
  status: 'rascunho' | 'publicado' | 'arquivado';
  link_funcionando: boolean;
  autoridade_nome?: string;
  autoridade_foto?: string | null;
  total_envios?: number;
}

export async function listAutoridades(): Promise<Autoridade[]> {
  const { data, error } = await supabase
    .from('autoridades')
    .select('*')
    .eq('ativo', true)
    .order('ordem');
  if (error) throw error;
  return (data ?? []).map((r) => unescapeRow(r as Autoridade));
}

export async function listContextos(): Promise<ContextoVideo[]> {
  const { data, error } = await supabase.from('contextos_video').select('*').order('ordem');
  if (error) throw error;
  return (data ?? []).map((r) => unescapeRow(r as ContextoVideo));
}

export async function listVideos(filtros?: { contexto?: string; autoridade?: string }): Promise<VideoAutoridade[]> {
  let q = supabase
    .from('videos_com_stats')
    .select('*')
    .eq('status', 'publicado')
    .eq('link_funcionando', true)
    .order('created_at', { ascending: false });
  if (filtros?.contexto) q = q.contains('contextos', [filtros.contexto]);
  if (filtros?.autoridade) q = q.eq('autoridade_id', filtros.autoridade);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => unescapeRow(r as VideoAutoridade));
}

export async function listVideosAdmin(): Promise<VideoAutoridade[]> {
  const { data, error } = await supabase
    .from('videos_com_stats')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => unescapeRow(r as VideoAutoridade));
}

export async function criarVideo(payload: Partial<VideoAutoridade> & {
  autoridade_id: string;
  url_original: string;
  titulo: string;
}) {
  const { data, error } = await supabase
    .from('videos_autoridade')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function atualizarVideo(id: string, payload: Partial<VideoAutoridade>) {
  const { error } = await supabase
    .from('videos_autoridade')
    .update(payload)
    .eq('id', id);
  if (error) throw error;
}

export async function registrarEnvio(params: {
  video_id: string;
  consultor_id: string;
  lead_id?: string | null;
  contexto?: string;
  mensagem_usada?: string;
}) {
  const { error } = await supabase.from('envios_video').insert(params);
  if (error) throw error;
}

/* ---------- helpers de URL ---------- */

export function extrairYouTubeID(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1]! : null;
}

export function detectarPlataforma(url: string): VideoAutoridade['plataforma'] {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/instagram\.com/.test(url)) return 'instagram';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  return 'outros';
}

export function thumbnailPorURL(url: string): string | null {
  const ytId = extrairYouTubeID(url);
  if (ytId) return `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
  return null;
}
