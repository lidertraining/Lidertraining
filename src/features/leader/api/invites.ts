import { supabase } from '@lib/supabase';

/**
 * Retorna o código pessoal permanente do consultor logado.
 * Esse código vincula novos cadastros automaticamente a ele.
 */
export async function getMyPersonalCode(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('personal_code')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  return (data as { personal_code?: string } | null)?.personal_code ?? null;
}

/**
 * Gera link de convite EM NOME de alguém da downline.
 * O novo cadastro vincula ao downlineId (não ao usuário logado).
 * Útil para líder ajudar consultor júnior a recrutar.
 */
export async function getDownlineInviteCode(downlineId: string): Promise<string> {
  const { data, error } = await supabase.rpc('generate_downline_invite_code', {
    p_downline_id: downlineId,
  });
  if (error) throw error;
  return data as string;
}

/**
 * Monta link público para /signup/:code com a URL atual do app.
 */
export function buildInviteURL(code: string): string {
  if (typeof window === 'undefined') return `/signup/${code}`;
  return `${window.location.origin}/signup/${code}`;
}

/**
 * Monta link pronto para compartilhamento no WhatsApp.
 */
export function buildWhatsAppShareURL(code: string, inviterName: string): string {
  const url = buildInviteURL(code);
  const message = [
    `Olá! Acabei de entrar na LiderTraining, uma plataforma incrível para consultores de marketing de rede.`,
    ``,
    `Estou te convidando pra conhecer — tem conteúdo de treinamento, CRM de contatos, jornada gamificada e muito mais.`,
    ``,
    `Clica aqui pra criar sua conta: ${url}`,
    ``,
    `— ${inviterName}`,
  ].join('\n');
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}
