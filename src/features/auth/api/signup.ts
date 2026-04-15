import { supabase } from '@lib/supabase';
import type { SignupInput } from '../schemas';

interface SignupWithInviteInput extends SignupInput {
  code: string;
}

/**
 * Fluxo:
 * 1) auth.signUp cria registro em auth.users
 * 2) RPC signup_with_invite cria perfil com upline_id do patrocinador
 */
export async function signupWithInvite({ email, password, name, code }: SignupWithInviteInput) {
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) throw authError;
  if (!authData.user) throw new Error('Falha ao criar usu\u00e1rio');

  const { data: profile, error: rpcError } = await supabase.rpc('signup_with_invite', {
    p_code: code,
    p_name: name,
  });
  if (rpcError) throw rpcError;

  return { auth: authData, profile };
}
