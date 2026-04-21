// ═══════════════════════════════════════════════════════════════════
// EDGE FUNCTION: passkey-register
// ═══════════════════════════════════════════════════════════════════
// Actions:
//   - "options": generates registration challenge for logged-in user
//   - "verify":  validates attestation and saves credential to DB
// ═══════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from 'https://esm.sh/@simplewebauthn/server@11.0.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RP_NAME = Deno.env.get('RP_NAME') ?? 'Líder Training';
const RP_ID = Deno.env.get('RP_ID') ?? 'localhost'; // your domain in prod
const ORIGIN = Deno.env.get('ORIGIN') ?? 'http://localhost:5173';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extract user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing authorization' }, 401);
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();

    // ─── ACTION: OPTIONS ───
    if (body.action === 'options') {
      // Get existing credentials to exclude
      const { data: existing } = await admin
        .from('passkey_credentials')
        .select('credential_id, transports')
        .eq('user_id', user.id);

      const userName = user.email || user.phone || user.id;
      const userDisplayName = user.user_metadata?.full_name || userName;

      const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: RP_ID,
        userID: new TextEncoder().encode(user.id),
        userName,
        userDisplayName,
        attestationType: 'none',
        excludeCredentials: (existing || []).map(c => ({
          id: c.credential_id,
          transports: c.transports || undefined,
        })),
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'required',
          authenticatorAttachment: 'platform',
        },
      });

      // Store challenge for verification step
      await admin.from('webauthn_challenges').insert({
        challenge: options.challenge,
        user_identifier: user.id,
        ceremony_type: 'register',
      });

      return json(options);
    }

    // ─── ACTION: VERIFY ───
    if (body.action === 'verify') {
      const { credential, deviceName, deviceType } = body;
      if (!credential) return json({ error: 'Missing credential' }, 400);

      // Retrieve stored challenge
      const expectedChallenge = credential.response?.clientDataJSON
        ? getChallengeFromClientData(credential.response.clientDataJSON)
        : null;

      const { data: chal } = await admin
        .from('webauthn_challenges')
        .select('*')
        .eq('challenge', expectedChallenge)
        .eq('ceremony_type', 'register')
        .eq('user_identifier', user.id)
        .gte('expires_at', new Date().toISOString())
        .maybeSingle();

      if (!chal) {
        return json({ error: 'Invalid or expired challenge' }, 400);
      }

      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: chal.challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        requireUserVerification: true,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return json({ error: 'Verification failed' }, 400);
      }

      const { credentialID, credentialPublicKey, counter } = verification.registrationInfo.credential ?? verification.registrationInfo;

      // Convert Uint8Array to base64url text for storage
      const credIdStr = typeof credentialID === 'string'
        ? credentialID
        : bufToB64Url(credentialID);
      const pubKeyStr = typeof credentialPublicKey === 'string'
        ? credentialPublicKey
        : bufToB64Url(credentialPublicKey);

      await admin.from('passkey_credentials').insert({
        user_id: user.id,
        credential_id: credIdStr,
        public_key: pubKeyStr,
        counter: counter ?? 0,
        device_name: deviceName ?? 'Dispositivo',
        device_type: deviceType ?? 'unknown',
        transports: credential.response?.transports ?? [],
      });

      // Delete consumed challenge
      await admin.from('webauthn_challenges').delete().eq('id', chal.id);

      return json({ success: true });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (err) {
    console.error('[passkey-register] error:', err);
    return json({ error: err.message || 'Internal error' }, 500);
  }
});

// ─── HELPERS ───
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function bufToB64Url(buf: Uint8Array | ArrayBuffer): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getChallengeFromClientData(clientDataJSON: string): string {
  try {
    // clientDataJSON is base64url-encoded JSON
    const json = atob(clientDataJSON.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(json);
    return parsed.challenge;
  } catch {
    return '';
  }
}
