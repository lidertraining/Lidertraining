// ═══════════════════════════════════════════════════════════════════
// LIDERTRAINING — Deep Linking & Referral Tracking (integrado ao schema)
// ═══════════════════════════════════════════════════════════════════
// Captura ?ref=CODE (UUID ou personal_code) da URL em qualquer page load.
// Persiste entre sessões até o usuário se cadastrar.
// Rastreia cliques para atribuição (referral_clicks).
// Gera links compartilháveis para cada consultor.
//
// NOTA: adaptado de auth-elite.zip para usar colunas reais:
//   name (em vez de full_name), upline_id (em vez de sponsor_id),
//   level (em vez de graduation), personal_code (lookup por short code).
// ═══════════════════════════════════════════════════════════════════

import { supabase } from './supabase';

const VISITOR_ID_KEY = 'lt_visitor_id';
const PENDING_SPONSOR_KEY = 'lt_pending_sponsor';
const REFERRAL_SESSION_KEY = 'lt_referral_session';
const SPONSOR_META_KEY = 'lt_sponsor_meta';

function generateVisitorId() {
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = generateVisitorId();
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return generateVisitorId();
  }
}

export function getStoredSponsor() {
  try { return localStorage.getItem(PENDING_SPONSOR_KEY); } catch { return null; }
}

export function setStoredSponsor(code) {
  try { localStorage.setItem(PENDING_SPONSOR_KEY, code); } catch { /* noop */ }
}

export function clearStoredSponsor() {
  try {
    localStorage.removeItem(PENDING_SPONSOR_KEY);
    localStorage.removeItem(SPONSOR_META_KEY);
  } catch { /* noop */ }
}

export async function captureReferralFromURL({
  cleanUrl = true,
  fetchSponsorInfo = true,
} = {}) {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const ref =
    params.get('ref') ||
    params.get('sponsor') ||
    params.get('p') ||
    params.get('patrocinador');

  if (!ref) return getStoredSponsor();

  const alreadyTracked = sessionStorage.getItem(REFERRAL_SESSION_KEY);
  if (alreadyTracked !== ref) {
    setStoredSponsor(ref);
    try { sessionStorage.setItem(REFERRAL_SESSION_KEY, ref); } catch { /* noop */ }

    const visitorId = getVisitorId();
    const utm = {
      source: params.get('utm_source'),
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
    };

    try {
      await supabase.rpc('track_referral_click', {
        p_ref_code: ref,
        p_visitor_id: visitorId,
        p_utm_source: utm.source,
        p_utm_medium: utm.medium,
        p_utm_campaign: utm.campaign,
        p_landing_path: window.location.pathname,
      });
    } catch (err) {
      console.warn('[referral] tracking failed:', err);
    }

    if (fetchSponsorInfo) {
      try {
        const info = await getSponsorInfo(ref);
        if (info) {
          localStorage.setItem(SPONSOR_META_KEY, JSON.stringify(info));
        }
      } catch { /* noop */ }
    }
  }

  if (cleanUrl) {
    try {
      const url = new URL(window.location.href);
      ['ref', 'sponsor', 'p', 'patrocinador', 'utm_source', 'utm_medium', 'utm_campaign']
        .forEach(k => url.searchParams.delete(k));
      window.history.replaceState({}, '', url.pathname + url.search);
    } catch { /* noop */ }
  }

  return ref;
}

// ═══════════════════════════════════════════════════════════════════
// SPONSOR INFO — schema real: name, avatar_url, level
// UUID → id · short code → personal_code
// ═══════════════════════════════════════════════════════════════════
export async function getSponsorInfo(sponsorCode) {
  if (!sponsorCode) return null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sponsorCode);

  try {
    const query = supabase
      .from('profiles')
      .select('id, name, avatar_url, level, personal_code');
    const { data } = isUuid
      ? await query.eq('id', sponsorCode).maybeSingle()
      : await query.eq('personal_code', sponsorCode).maybeSingle();
    if (!data) return null;
    // Normaliza para os nomes que a UI do LiderAuthElite espera
    return {
      id: data.id,
      full_name: data.name,
      avatar_url: data.avatar_url,
      graduation: data.level,
      personal_code: data.personal_code,
    };
  } catch {
    return null;
  }
}

export function getCachedSponsorInfo() {
  try {
    const raw = localStorage.getItem(SPONSOR_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function generateReferralLink(userId, {
  baseUrl = window.location.origin,
  path = '/',
  utm = {},
} = {}) {
  const url = new URL(path, baseUrl);
  url.searchParams.set('ref', userId);
  if (utm.source) url.searchParams.set('utm_source', utm.source);
  if (utm.medium) url.searchParams.set('utm_medium', utm.medium);
  if (utm.campaign) url.searchParams.set('utm_campaign', utm.campaign);
  return url.toString();
}

export function buildShareMessage(userId, userName, opts = {}) {
  const link = generateReferralLink(userId, {
    utm: { source: opts.channel || 'whatsapp', medium: 'referral' },
  });
  const messages = {
    whatsapp:
      `Oi! Sou ${userName} e quero te mostrar uma coisa incrível 💜\n\n` +
      `Descobri uma plataforma de desenvolvimento pessoal e empreendedorismo que mudou meu jogo. ` +
      `É uma jornada gamificada com trilhas, missões e resultados reais.\n\n` +
      `Dá uma olhada: ${link}`,
    casual:
      `Cria sua conta com meu link: ${link}\n\nTe explico tudo depois 😉`,
    professional:
      `Compartilho com você o LiderTraining, uma plataforma de aprendizado e desenvolvimento.\n\n` +
      `Acesse: ${link}\n\nQualquer dúvida estou à disposição.`,
  };
  return messages[opts.tone] || messages.casual;
}

export async function shareReferral(userId, userName, opts = {}) {
  const message = buildShareMessage(userId, userName, opts);
  const link = generateReferralLink(userId, opts);

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'LiderTraining',
        text: message,
        url: link,
      });
      return { method: 'native' };
    } catch (err) {
      if (err.name === 'AbortError') return { method: 'cancelled' };
    }
  }

  try {
    await navigator.clipboard.writeText(message);
    return { method: 'clipboard' };
  } catch {
    return { method: 'manual', text: message };
  }
}

export function setupPWADeepLinkHandler() {
  if ('launchQueue' in window) {
    window.launchQueue.setConsumer(async (launchParams) => {
      if (launchParams.targetURL) {
        const url = new URL(launchParams.targetURL);
        const ref = url.searchParams.get('ref');
        if (ref) {
          setStoredSponsor(ref);
          const visitorId = getVisitorId();
          try {
            await supabase.rpc('track_referral_click', {
              p_ref_code: ref,
              p_visitor_id: visitorId,
              p_landing_path: url.pathname,
            });
          } catch { /* noop */ }
        }
      }
    });
  }
}
