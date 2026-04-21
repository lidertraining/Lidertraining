// ═══════════════════════════════════════════════════════════════════
// LIDERTRAINING — Passkey / Biometric Authentication
// ═══════════════════════════════════════════════════════════════════
// Uses @simplewebauthn/browser on client
// Server verification via Supabase Edge Functions (see supabase/functions/)
// ═══════════════════════════════════════════════════════════════════
// Install: npm install @simplewebauthn/browser
// ═══════════════════════════════════════════════════════════════════

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { supabase } from './supabase';

const HINT_KEY = 'lt_biometric_hint';

// ═══════════════════════════════════════════════════════════════════
// CAPABILITY DETECTION
// ═══════════════════════════════════════════════════════════════════
export function isBiometricSupported() {
  return typeof window !== 'undefined'
    && !!window.PublicKeyCredential
    && typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
}

export async function isBiometricAvailable() {
  if (!isBiometricSupported()) return false;
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

// Check if browser supports conditional UI (autofill-style passkey prompt)
export async function supportsConditionalUI() {
  if (!isBiometricSupported()) return false;
  try {
    return await window.PublicKeyCredential.isConditionalMediationAvailable?.() ?? false;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// DEVICE INFO (for friendly passkey names)
// ═══════════════════════════════════════════════════════════════════
function detectDevice() {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return { name: 'iPhone', type: 'iphone' };
  if (/iPad/i.test(ua)) return { name: 'iPad', type: 'ipad' };
  if (/Android/i.test(ua)) return { name: 'Android', type: 'android' };
  if (/Mac/i.test(ua)) return { name: 'Mac', type: 'mac' };
  if (/Windows/i.test(ua)) return { name: 'Windows', type: 'windows' };
  return { name: 'Este dispositivo', type: 'unknown' };
}

// ═══════════════════════════════════════════════════════════════════
// REGISTER A NEW PASSKEY (for logged-in user)
// ═══════════════════════════════════════════════════════════════════
export async function registerPasskey() {
  if (!await isBiometricAvailable()) {
    throw new Error('Biometria não disponível neste dispositivo.');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Você precisa estar logado para ativar biometria.');
  }

  // 1) Ask Edge Function to generate registration options + challenge
  const { data: options, error: optErr } = await supabase.functions.invoke(
    'passkey-register',
    {
      body: { action: 'options' },
    }
  );
  if (optErr || !options) {
    throw new Error(optErr?.message || 'Falha ao gerar desafio de registro.');
  }

  // 2) Create credential on the device (triggers Face ID / Touch ID)
  let credential;
  try {
    credential = await startRegistration({ optionsJSON: options });
  } catch (err) {
    if (err.name === 'InvalidStateError') {
      throw new Error('Esse dispositivo já tem uma passkey cadastrada.');
    }
    if (err.name === 'NotAllowedError') {
      throw new Error('Cadastro cancelado.');
    }
    throw err;
  }

  const device = detectDevice();

  // 3) Send credential to Edge Function for verification + storage
  const { data: verified, error: verErr } = await supabase.functions.invoke(
    'passkey-register',
    {
      body: {
        action: 'verify',
        credential,
        deviceName: device.name,
        deviceType: device.type,
      },
    }
  );

  if (verErr || !verified?.success) {
    throw new Error(verErr?.message || 'Falha ao verificar passkey.');
  }

  // 4) Mark profile as biometric-enabled
  await supabase.from('profiles')
    .update({ biometric_enabled: true })
    .eq('id', session.user.id);

  // 5) Store hint for future login UI
  storeBiometricHint({
    email: session.user.email,
    name: session.user.user_metadata?.full_name,
    deviceName: device.name,
  });

  return { success: true, deviceName: device.name };
}

// ═══════════════════════════════════════════════════════════════════
// AUTHENTICATE WITH PASSKEY (passwordless login)
// ═══════════════════════════════════════════════════════════════════
export async function authenticateWithPasskey({ conditional = false } = {}) {
  if (!await isBiometricAvailable()) {
    throw new Error('Biometria não disponível.');
  }

  // 1) Request authentication options from Edge Function
  const { data: options, error: optErr } = await supabase.functions.invoke(
    'passkey-login',
    {
      body: { action: 'options' },
    }
  );
  if (optErr || !options) {
    throw new Error(optErr?.message || 'Falha ao gerar desafio de login.');
  }

  // 2) Prompt user (Face ID / Touch ID)
  let assertion;
  try {
    assertion = await startAuthentication({
      optionsJSON: options,
      useBrowserAutofill: conditional,
    });
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Autenticação cancelada.');
    }
    throw err;
  }

  // 3) Verify and get session tokens
  const { data: result, error: verErr } = await supabase.functions.invoke(
    'passkey-login',
    {
      body: { action: 'verify', assertion },
    }
  );

  if (verErr || !result?.success) {
    throw new Error(verErr?.message || 'Falha ao validar biometria.');
  }

  // 4) Set Supabase session from returned tokens
  if (result.session) {
    const { error: sessErr } = await supabase.auth.setSession({
      access_token: result.session.access_token,
      refresh_token: result.session.refresh_token,
    });
    if (sessErr) throw sessErr;
  } else if (result.email && result.hashed_token) {
    // Alternative flow: verify OTP from magic link hash
    const { error: otpErr } = await supabase.auth.verifyOtp({
      email: result.email,
      token_hash: result.hashed_token,
      type: 'magiclink',
    });
    if (otpErr) throw otpErr;
  }

  return { success: true, user: result.user };
}

// ═══════════════════════════════════════════════════════════════════
// LIST / REMOVE PASSKEYS (from account settings)
// ═══════════════════════════════════════════════════════════════════
export async function listPasskeys() {
  const { data, error } = await supabase
    .from('passkey_credentials')
    .select('id, credential_id, device_name, device_type, last_used_at, created_at')
    .order('last_used_at', { ascending: false });
  return { data, error };
}

export async function removePasskey(id) {
  const { error } = await supabase
    .from('passkey_credentials')
    .delete()
    .eq('id', id);

  // If no passkeys left, unmark biometric_enabled
  const { data: remaining } = await supabase
    .from('passkey_credentials')
    .select('id', { count: 'exact', head: true });
  if ((remaining?.length ?? 0) === 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles')
        .update({ biometric_enabled: false })
        .eq('id', user.id);
    }
    clearBiometricHint();
  }

  return { error };
}

// ═══════════════════════════════════════════════════════════════════
// LOCAL HINT STORAGE (to show "Entrar com biometria" on login screen)
// ═══════════════════════════════════════════════════════════════════
export function storeBiometricHint(hint) {
  try {
    localStorage.setItem(HINT_KEY, JSON.stringify({ ...hint, timestamp: Date.now() }));
  } catch {}
}

export function getBiometricHint() {
  try {
    const raw = localStorage.getItem(HINT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearBiometricHint() {
  try {
    localStorage.removeItem(HINT_KEY);
  } catch {}
}

// ═══════════════════════════════════════════════════════════════════
// CHECK IF USER SHOULD SEE "ENABLE BIOMETRIC" PROMPT
// Call after password/OTP login
// ═══════════════════════════════════════════════════════════════════
export async function shouldPromptEnableBiometric() {
  if (!await isBiometricAvailable()) return false;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('biometric_enabled')
    .eq('id', user.id)
    .maybeSingle();

  return !profile?.biometric_enabled;
}
