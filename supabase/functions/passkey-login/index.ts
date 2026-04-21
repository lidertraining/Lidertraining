// ═══════════════════════════════════════════════════════════════════
// EDGE FUNCTION: passkey-login
// ═══════════════════════════════════════════════════════════════════
// Actions:
//   - "options": generates authentication challenge (no auth required)
//   - "verify":  validates assertion and creates Supabase session via
//                admin-generated magic link (token_hash approach)
// ═══════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from 'https://esm.sh/@simplewebauthn/server@11.0.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RP_ID = Deno.env.get('RP_ID') ?? 'localhost';
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
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();

    // ─── ACTION: OPTIONS ───
    if (body.action === 'options') {
      const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        userVerification: 'required',
        // allowCredentials empty → discoverable credentials (usernameless flow)
        allowCredentials: [],
      });

      await admin.from('webauthn_challenges').insert({
        challenge: options.challenge,
        ceremony_type: 'login',
      });

      return json(options);
    }

    // ─── ACTION: VERIFY ───
    if (body.action === 'verify') {
      const { assertion } = body;
      if (!assertion) return json({ error: 'Missing assertion' }, 400);

      const challenge = assertion.response?.clientDataJSON
        ? getChallengeFromClientData(assertion.response.clientDataJSON)
        : null;

      const { data: chal } = await admin
        .from('webauthn_challenges')
        .select('*')
        .eq('challenge', challenge)
        .eq('ceremony_type', 'login')
        .gte('expires_at', new Date().toISOString())
        .maybeSingle();

      if (!chal) {
        return json({ error: 'Invalid or expired challenge' }, 400);
      }

      // Find the credential in our DB
      const credentialId = assertion.id || assertion.rawId;
      const { data: stored } = await admin
        .from('passkey_credentials')
        .select('*, user_id')
        .eq('credential_id', credentialId)
        .maybeSingle();

      if (!stored) {
        return json({ error: 'Credential not recognized' }, 401);
      }

      const verification = await verifyAuthenticationResponse({
        response: assertion,
        expectedChallenge: chal.challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: stored.credential_id,
          publicKey: b64UrlToBuf(stored.public_key),
          counter: Number(stored.counter) || 0,
        },
        requireUserVerification: true,
      });

      if (!verification.verified) {
        return json({ error: 'Authentication failed' }, 401);
      }

      // Update counter + last_used_at
      await admin
        .from('passkey_credentials')
        .update({
          counter: verification.authenticationInfo.newCounter,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', stored.id);

      // Remove consumed challenge
      await admin.from('webauthn_challenges').delete().eq('id', chal.id);

      // Get user's email for session creation
      const { data: userData } = await admin.auth.admin.getUserById(stored.user_id);
      const email = userData?.user?.email;
      if (!email) {
        return json({ error: 'User has no email for session' }, 500);
      }

      // Generate a magic link the client can consume to create a session
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email,
      });

      if (linkErr || !linkData) {
        return json({ error: 'Session generation failed' }, 500);
      }

      // Return email + token_hash so client can call verifyOtp
      return json({
        success: true,
        email,
        hashed_token: linkData.properties.hashed_token,
        user: {
          id: stored.user_id,
          email,
        },
      });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (err) {
    console.error('[passkey-login] error:', err);
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

function b64UrlToBuf(str: string): Uint8Array {
  const s = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    str.length + (4 - (str.length % 4)) % 4, '='
  );
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function getChallengeFromClientData(clientDataJSON: string): string {
  try {
    const json = atob(clientDataJSON.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(json);
    return parsed.challenge;
  } catch {
    return '';
  }
}
