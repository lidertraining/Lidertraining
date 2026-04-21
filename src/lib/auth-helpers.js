// ═══════════════════════════════════════════════════════════════════
// LIDERTRAINING — Auth Helpers (integrado ao schema existente)
// ═══════════════════════════════════════════════════════════════════
// Handles: password login/signup, WhatsApp OTP, Google/Apple OAuth,
// password reset, rate limiting, referral conversion tracking
//
// NOTA: este arquivo reusa o cliente Supabase existente em ./supabase.
// Não cria um segundo client (preserva sessões atuais).
// Mapeia para colunas reais do schema: name, phone, upline_id, personal_code.
// ═══════════════════════════════════════════════════════════════════

import { supabase } from './supabase';

// ═══════════════════════════════════════════════════════════════════
// PHONE NORMALIZATION (Brazil → E.164)
// ═══════════════════════════════════════════════════════════════════
export function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('55') && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  return `+${digits}`;
}

export function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
}

// ═══════════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════════
export async function checkRateLimit(identifier, { maxAttempts = 5, windowMinutes = 15 } = {}) {
  try {
    const { data, error } = await supabase.rpc('check_auth_rate_limit', {
      p_identifier: identifier,
      p_max_attempts: maxAttempts,
      p_window_minutes: windowMinutes,
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[rate-limit] check failed, allowing request:', err);
    return { allowed: true };
  }
}

async function logAttempt(identifier, type, success, errorCode = null) {
  try {
    await supabase.rpc('log_auth_attempt', {
      p_identifier: identifier,
      p_attempt_type: type,
      p_success: success,
      p_error_code: errorCode,
    });
  } catch (err) {
    console.warn('[log-attempt] failed:', err);
  }
}

// ═══════════════════════════════════════════════════════════════════
// REFERRAL CONVERSION HOOK — grava upline_id (não sponsor_id)
// ═══════════════════════════════════════════════════════════════════
async function convertReferralIfAny(userId) {
  const visitorId = localStorage.getItem('lt_visitor_id');
  const pendingSponsor = localStorage.getItem('lt_pending_sponsor');

  if (visitorId) {
    try {
      await supabase.rpc('convert_referral', {
        p_visitor_id: visitorId,
        p_user_id: userId,
      });
    } catch (err) {
      console.warn('[referral] conversion failed:', err);
    }
  }

  if (pendingSponsor) {
    try {
      // Resolve pendingSponsor (pode ser UUID do upline ou personal_code)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pendingSponsor);
      let uplineUuid = null;
      if (isUuid) {
        uplineUuid = pendingSponsor;
      } else {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('personal_code', pendingSponsor)
          .maybeSingle();
        uplineUuid = data?.id ?? null;
      }
      if (uplineUuid) {
        await supabase.from('profiles').update({ upline_id: uplineUuid }).eq('id', userId);
      }
      localStorage.removeItem('lt_pending_sponsor');
    } catch (err) {
      console.warn('[referral] upline update failed:', err);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// ERROR TRANSLATION (Supabase error → Portuguese)
// ═══════════════════════════════════════════════════════════════════
export function translateAuthError(error) {
  if (!error) return null;
  const msg = String(error.message || error).toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid email or password'))
    return 'Email/WhatsApp ou senha incorretos.';
  if (msg.includes('email not confirmed'))
    return 'Email ainda não foi confirmado. Verifique sua caixa de entrada.';
  if (msg.includes('user already registered') || msg.includes('already been registered'))
    return 'Esse email já está cadastrado. Tente fazer login.';
  if (msg.includes('password should be at least'))
    return 'A senha precisa ter pelo menos 6 caracteres.';
  if (msg.includes('weak password'))
    return 'Senha muito fraca. Use números e letras maiúsculas.';
  if (msg.includes('invalid phone'))
    return 'WhatsApp inválido. Use formato (11) 99999-9999.';
  if (msg.includes('token has expired') || msg.includes('otp expired'))
    return 'O código expirou. Peça um novo.';
  if (msg.includes('invalid otp') || msg.includes('token is invalid'))
    return 'Código incorreto. Confira e tente de novo.';
  if (msg.includes('rate limit') || msg.includes('too many requests'))
    return 'Muitas tentativas. Aguarde um momento.';
  if (msg.includes('user not found'))
    return 'Conta não encontrada. Quer criar uma?';
  if (msg.includes('network'))
    return 'Sem internet. Verifique sua conexão.';

  return error.message || 'Algo deu errado. Tente de novo.';
}

// ═══════════════════════════════════════════════════════════════════
// SIGN UP (email + password) — metadata segue nomes do schema
// ═══════════════════════════════════════════════════════════════════
export async function signUpWithPassword({ name, email, whatsapp, password, sponsorId }) {
  const phone = normalizePhone(whatsapp);
  const normalizedEmail = email.toLowerCase().trim();

  const rate = await checkRateLimit(normalizedEmail, { maxAttempts: 3, windowMinutes: 30 });
  if (!rate.allowed) {
    return {
      data: null,
      error: { message: `Muitas tentativas. Aguarde ${Math.ceil(rate.retry_in_seconds / 60)} minutos.` },
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    phone: phone || undefined,
    options: {
      data: {
        name,
        phone,
        pending_sponsor: sponsorId || null,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  await logAttempt(normalizedEmail, 'signup', !error, error?.code);

  if (data?.user && !error) {
    // Garante que o profile existe (upsert — sem trigger handle_new_user)
    try {
      await supabase.from('profiles').upsert(
        { id: data.user.id, name, phone },
        { onConflict: 'id' },
      );
    } catch { /* noop — pode não ter sessão ainda */ }
    if (sponsorId) {
      localStorage.setItem('lt_pending_sponsor', sponsorId);
    }
    await convertReferralIfAny(data.user.id);
  }

  return {
    data,
    error: error ? { ...error, message: translateAuthError(error) } : null,
  };
}

// ═══════════════════════════════════════════════════════════════════
// SIGN IN (email/phone + password)
// ═══════════════════════════════════════════════════════════════════
export async function signInWithPassword({ identifier, password }) {
  const isEmailAddr = isEmail(identifier);
  const normalized = isEmailAddr ? identifier.toLowerCase().trim() : normalizePhone(identifier);

  if (!normalized) {
    return { data: null, error: { message: 'Informe um email ou WhatsApp válido.' } };
  }

  const rate = await checkRateLimit(normalized, { maxAttempts: 5, windowMinutes: 15 });
  if (!rate.allowed) {
    return {
      data: null,
      error: {
        message: `Muitas tentativas. Aguarde ${Math.ceil(rate.retry_in_seconds / 60)} minutos ou recupere sua senha.`,
        locked: true,
      },
    };
  }

  const credentials = isEmailAddr
    ? { email: normalized, password }
    : { phone: normalized, password };

  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  await logAttempt(normalized, 'login', !error, error?.code);

  return {
    data,
    error: error ? { ...error, message: translateAuthError(error) } : null,
  };
}

// ═══════════════════════════════════════════════════════════════════
// WHATSAPP OTP — SEND
// Requer: Supabase Auth Phone Provider configurado (Twilio com canal WhatsApp)
// ═══════════════════════════════════════════════════════════════════
export async function sendWhatsAppOTP({ whatsapp, createUser = true }) {
  const phone = normalizePhone(whatsapp);
  if (!phone) {
    return { data: null, error: { message: 'WhatsApp inválido. Use (11) 99999-9999.' } };
  }

  const rate = await checkRateLimit(phone, { maxAttempts: 3, windowMinutes: 10 });
  if (!rate.allowed) {
    return {
      data: null,
      error: {
        message: `Aguarde ${Math.ceil(rate.retry_in_seconds / 60)} minutos para reenviar.`,
        locked: true,
      },
    };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      channel: 'whatsapp',
      shouldCreateUser: createUser,
    },
  });

  await logAttempt(phone, 'otp', !error, error?.code);

  return {
    data,
    error: error ? { ...error, message: translateAuthError(error) } : null,
  };
}

// ═══════════════════════════════════════════════════════════════════
// WHATSAPP OTP — VERIFY
// ═══════════════════════════════════════════════════════════════════
export async function verifyWhatsAppOTP({ whatsapp, code, meta = {} }) {
  const phone = normalizePhone(whatsapp);
  if (!phone) {
    return { data: null, error: { message: 'WhatsApp inválido.' } };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: code,
    type: 'sms',
  });

  await logAttempt(phone, 'otp', !error && !!data?.session, error?.code);

  if (data?.user && !error) {
    const patch = {};
    if (meta.name) patch.name = meta.name;
    patch.phone = phone;
    if (Object.keys(patch).length > 0) {
      try {
        await supabase.from('profiles').update(patch).eq('id', data.user.id);
      } catch { /* noop */ }
    }
    if (meta.sponsorId) {
      localStorage.setItem('lt_pending_sponsor', meta.sponsorId);
    }
    await convertReferralIfAny(data.user.id);
  }

  return {
    data,
    error: error ? { ...error, message: translateAuthError(error) } : null,
  };
}

// ═══════════════════════════════════════════════════════════════════
// OAUTH (Google, Apple)
// ═══════════════════════════════════════════════════════════════════
export async function signInWithOAuth(provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  return {
    data,
    error: error ? { ...error, message: translateAuthError(error) } : null,
  };
}

export async function handleOAuthCallback() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    await convertReferralIfAny(session.user.id);
  }
  return { session };
}

// ═══════════════════════════════════════════════════════════════════
// PASSWORD RESET
// ═══════════════════════════════════════════════════════════════════
export async function sendPasswordReset(identifier) {
  const isEmailAddr = isEmail(identifier);

  if (isEmailAddr) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      identifier.toLowerCase().trim(),
      { redirectTo: `${window.location.origin}/auth/reset` }
    );
    await logAttempt(identifier, 'reset', !error, error?.code);
    return {
      data,
      error: error ? { ...error, message: translateAuthError(error) } : null,
    };
  }

  return sendWhatsAppOTP({ whatsapp: identifier, createUser: false });
}

export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  return {
    data,
    error: error ? { ...error, message: translateAuthError(error) } : null,
  };
}

// ═══════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════
export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  return { ...user, profile };
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// ═══════════════════════════════════════════════════════════════════
// ACCOUNT EXISTENCE CHECK
// Para email: profiles.email não existe — não podemos checar; retorna false
// Para phone: checa via profiles.phone (campo real do schema)
// ═══════════════════════════════════════════════════════════════════
export async function accountExists(identifier) {
  if (!identifier) return false;
  const isEmailAddr = isEmail(identifier);

  try {
    if (isEmailAddr) {
      // profiles.email não existe no schema atual — skip para não vazar existência
      return false;
    } else {
      const phone = normalizePhone(identifier);
      if (!phone) return false;
      const digits = phone.replace(/\D/g, '');
      // phone em profiles é armazenado só com dígitos (sem + ou 55 no início em alguns casos)
      // testa variantes: +55DDD, 55DDD, DDD
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .or(`phone.eq.${digits},phone.eq.${digits.replace(/^55/, '')}`)
        .maybeSingle();
      return !!data;
    }
  } catch {
    return false;
  }
}
