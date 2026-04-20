import { supabase } from '@lib/supabase';
import { normalizePhone } from '@lib/phone';
import type { SignupInput } from '../schemas';

interface SignupWithInviteInput extends SignupInput {
  code: string;
}

/**
 * Fluxo de cadastro resiliente:
 *
 * 1) Tenta criar auth user
 * 2) Se der "already registered", tenta signIn (caso user ficou sem profile)
 * 3) Se não tiver sessão (confirm email ligado), faz signIn pra obter sessão
 * 4) Cria profile via RPC (tenta com phone, fallback sem phone)
 * 5) INDEPENDENTE do caminho da RPC, sempre faz UPDATE em profiles.phone
 *    pra garantir que o telefone foi salvo — resolve o caso onde a migration
 *    20260416200000_profile_phone.sql ainda não foi rodada no DB.
 */
export async function signupWithInvite({
  email,
  password,
  name,
  phone,
  dataNascimento,
  code,
}: SignupWithInviteInput) {
  const phoneDigits = normalizePhone(phone);
  const birthday = dataNascimento && dataNascimento.length > 0 ? dataNascimento : null;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    const isAlreadyRegistered =
      authError.message?.toLowerCase().includes('already') ||
      authError.status === 422;

    if (!isAlreadyRegistered) throw authError;

    return await signInAndEnsureProfile(email, password, code, name, phoneDigits, birthday);
  }

  if (!authData.user) throw new Error('Falha ao criar usuário');

  let session = authData.session;

  if (!session) {
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
    throw new Error('Conta criada! Confirme seu email e depois faça login.');
  }

  return await createProfileAndEnsurePhone(code, name, phoneDigits, birthday, authData);
}

async function signInAndEnsureProfile(
  email: string,
  password: string,
  code: string,
  name: string,
  phoneDigits: string,
  birthday: string | null,
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

  const { data: existing } = await supabase
    .from('profiles')
    .select('id, phone, data_nascimento')
    .eq('id', signInData.user.id)
    .maybeSingle();

  if (existing) {
    // Profile já existe — completa campos faltantes
    const patch: Record<string, unknown> = {};
    if (!existing.phone && phoneDigits) patch.phone = phoneDigits;
    if (!existing.data_nascimento && birthday) patch.data_nascimento = birthday;
    if (Object.keys(patch).length > 0) {
      await supabase.from('profiles').update(patch).eq('id', signInData.user.id);
    }
    return { auth: signInData, profile: existing };
  }

  return await createProfileAndEnsurePhone(code, name, phoneDigits, birthday, signInData);
}

async function createProfileAndEnsurePhone(
  code: string,
  name: string,
  phoneDigits: string,
  birthday: string | null,
  authResult: { user?: { id: string } | null; session?: unknown },
) {
  // Tenta a versão com 3 params (phone) — ideal
  const { data: profile, error: rpcError } = await supabase.rpc('signup_with_invite', {
    p_code: code,
    p_name: name,
    p_phone: phoneDigits,
  });

  const userId = authResult.user?.id;

  if (!rpcError) {
    // Sucesso: RPC salvou phone. Agora grava data_nascimento se fornecida.
    if (userId && birthday) {
      await supabase.from('profiles').update({ data_nascimento: birthday }).eq('id', userId);
    }
    return { auth: authResult, profile };
  }

  // Fallback: RPC antiga sem p_phone
  if (rpcError.message?.includes('function') || rpcError.code === '42883') {
    const { data: profileFallback, error: fallbackError } = await supabase.rpc(
      'signup_with_invite',
      { p_code: code, p_name: name },
    );
    if (fallbackError) throw fallbackError;

    // GARANTE phone e data_nascimento via UPDATE direto
    if (userId) {
      const patch: Record<string, unknown> = {};
      if (phoneDigits) patch.phone = phoneDigits;
      if (birthday) patch.data_nascimento = birthday;
      if (Object.keys(patch).length > 0) {
        await supabase.from('profiles').update(patch).eq('id', userId);
      }
    }

    return { auth: authResult, profile: profileFallback };
  }

  throw rpcError;
}
