import { supabase } from '@lib/supabase';
import type { SignupInput } from '../schemas';

interface SignupWithInviteInput extends SignupInput {
  code: string;
}

/**
 * Fluxo de cadastro resiliente:
 *
 * Problema real: Supabase com "Confirm email" ligado cria o auth user
 * mas NÃO retorna sessão. Sem sessão, auth.uid() é null no RPC e o
 * profile não é criado. O user tenta de novo → "already registered".
 *
 * Solução: após signUp, se não tiver sessão, faz signIn imediato
 * pra obter sessão antes de chamar o RPC.
 */
export async function signupWithInvite({
  email,
  password,
  name,
  phone,
  code,
}: SignupWithInviteInput) {
  // 1) Tenta criar auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  // Se já existe, tenta logar direto
  if (authError) {
    const isAlreadyRegistered =
      authError.message?.toLowerCase().includes('already') ||
      authError.status === 422;

    if (!isAlreadyRegistered) throw authError;

    return await signInAndEnsureProfile(email, password, code, name, phone);
  }

  // 2) signUp deu certo — mas pode não ter sessão (confirm email ligado)
  let session = authData.session;

  if (!session) {
    // Tenta signIn imediato pra pegar sessão
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw new Error(
        'Conta criada mas o email precisa ser confirmado. ' +
        'Verifique sua caixa de entrada (ou spam) e clique no link de confirmação. ' +
        'Depois volte e faça login.',
      );
    }

    session = signInData.session;
  }

  if (!session) {
    throw new Error(
      'Conta criada! Confirme seu email e depois faça login.',
    );
  }

  // 3) Agora temos sessão — cria profile
  return await createProfileIfNeeded(code, name, phone, authData);
}

async function signInAndEnsureProfile(
  email: string,
  password: string,
  code: string,
  name: string,
  phone: string,
) {
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    throw new Error(
      'E-mail já cadastrado. Se já tem conta, faça login. Se esqueceu a senha, use recuperação.',
    );
  }

  if (!signInData.user) throw new Error('Falha ao autenticar');

  // Checa se profile já existe
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', signInData.user.id)
    .maybeSingle();

  if (existing) {
    return { auth: signInData, profile: existing };
  }

  return await createProfileIfNeeded(code, name, phone, signInData);
}

async function createProfileIfNeeded(
  code: string,
  name: string,
  phone: string,
  authResult: { user?: { id: string } | null; session?: unknown },
) {
  // Tenta a versão com 3 params (phone)
  const { data: profile, error: rpcError } = await supabase.rpc('signup_with_invite', {
    p_code: code,
    p_name: name,
    p_phone: phone,
  });

  if (rpcError) {
    // Se der "function not found" (migration de phone não rodou), tenta sem phone
    if (rpcError.message?.includes('function') || rpcError.code === '42883') {
      const { data: profileFallback, error: fallbackError } = await supabase.rpc(
        'signup_with_invite',
        { p_code: code, p_name: name },
      );
      if (fallbackError) throw fallbackError;
      return { auth: authResult, profile: profileFallback };
    }
    throw rpcError;
  }

  return { auth: authResult, profile };
}
