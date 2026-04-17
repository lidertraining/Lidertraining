import { supabase } from '@lib/supabase';

const BUCKET = 'conhecimentos';
const SIGNED_URL_TTL = 3600; // 1 hora

/**
 * Gera URL assinada pra acessar arquivo privado do bucket 'conhecimentos'.
 * Dura 1 hora. Se o arquivo não existir, retorna null.
 */
export async function getSignedUrl(path: string): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error) return null;
  return data.signedUrl;
}

/**
 * Upload de arquivo pro bucket 'conhecimentos'.
 * Retorna o path no storage (pra salvar na tabela conhecimentos.arquivo_path).
 */
export async function uploadConhecimento(
  file: File,
  folder: string,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '86400', upsert: false });

  if (error) throw error;
  return path;
}
