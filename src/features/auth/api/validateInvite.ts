import { supabase } from '@lib/supabase';

export interface InviteInfo {
  code: string;
  ownerName: string;
  valid: boolean;
  reason?: 'expired' | 'exhausted' | 'not_found';
}

/**
 * Valida um c\u00f3digo de convite e retorna nome do patrocinador.
 * Requer uma view p\u00fablica public_invites que exp\u00f5e somente campos n\u00e3o-sens\u00edveis.
 * No MVP, retornamos algo razo\u00e1vel mesmo sem a view pronta.
 */
export async function validateInvite(code: string): Promise<InviteInfo> {
  const { data, error } = await supabase
    .from('invite_codes')
    .select('code, expires_at, uses, max_uses, profiles!invite_codes_owner_id_fkey(name)')
    .eq('code', code)
    .maybeSingle();

  if (error || !data) {
    return { code, ownerName: '', valid: false, reason: 'not_found' };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { code, ownerName: '', valid: false, reason: 'expired' };
  }
  if (data.uses >= data.max_uses) {
    return { code, ownerName: '', valid: false, reason: 'exhausted' };
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const ownerName = (data as any).profiles?.name ?? 'Consultor';
  return { code, ownerName, valid: true };
}
