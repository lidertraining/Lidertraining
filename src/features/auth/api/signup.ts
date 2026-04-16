import { supabase } from '@lib/supabase';
import type { SignupInput } from '../schemas';

interface SignupWithInviteInput extends SignupInput {
  code: string;
}

/**
 * Fluxo resiliente de cadastro:
 * 1) Tenta auth.signUp — se funcionar, cria profile via RPC
 * 2) Se "User already registered", tenta auth.signIn com mesmas credenciais
 *    e verifica se profile já existe. Se não, cria via RPC.
 * 3) Se signIn também falhar, joga o erro original.
 *
 * Isso resolve o cenário comum onde a pessoa fez signUp mas nunca confirmou
 * o email (ou deu erro na RPC) e tenta novamente.
 */
export async function signupWithInvite({
  email,
  password,
  name,
  phone,
  code,
}: SignupWithInviteInput) {
  // Passo 1: tenta criar auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    const isAlreadyRegistered =
      authError.message?.toLowerCase().includes('already registered') ||
      authError.message?.toLowerCase().includes('already been registered') ||
      authError.status === 422;

    if (!isAlreadyRegistered) throw authError;

    // Passo 2: user já existe no auth — tenta logar
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw new Error(
        'E-mail já cadastrado. Se você já tem conta, vá para a tela de login. Se esqueceu a senha, use "esqueci a senha".',
      );
    }

    if (!signInData.user) throw new Error('Falha ao autenticar');

    // Passo 3: checa se profile já existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', signInData.user.id)
      .maybeSingle();

    if (existingProfile) {
      return { auth: signInData, profile: existingProfile };
    }

    // Passo 4: profile não existe — cria via RPC
    const { data: profile, error: rpcError } = await supabase.rpc('signup_with_invite', {
      p_code: code,
      p_name: name,
      p_phone: phone,
    });
    if (rpcError) throw rpcError;
    return { auth: signInData, profile };
  }

  if (!authData.user) throw new Error('Falha ao criar usuário');

  // Caminho feliz: auth user criado com sucesso → cria profile
  const { data: profile, error: rpcError } = await supabase.rpc('signup_with_invite', {
    p_code: code,
    p_name: name,
    p_phone: phone,
  });
  if (rpcError) throw rpcError;

  return { auth: authData, profile };
}
