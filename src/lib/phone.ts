/**
 * Helpers de normalização e construção de URLs telefônicas.
 *
 * IMPORTANTE: todas as assinaturas das funções antigas (normalizePhone,
 * withCountryBR, buildWaURL, formatPhoneBR) foram preservadas. Só expandimos.
 */

/** Remove tudo que não é dígito. */
export const normalizePhone = (raw: string): string => (raw ?? '').replace(/\D/g, '');

/**
 * Garante o prefixo BR '55' para números de 10 ou 11 dígitos.
 * Se já tem 55 na frente, não duplica. Para números internacionais já com
 * código de país diferente, retorna os dígitos como estão.
 */
export const withCountryBR = (digits: string): string => {
  const d = normalizePhone(digits);
  if (d.length === 0) return '';
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) return d;
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return d;
};

/**
 * Monta a URL canônica do WhatsApp (https://wa.me/{phone}?text=...).
 * - Aceita qualquer formato de entrada (com ou sem DDI/DDD, com ou sem máscaras)
 * - Garante prefixo 55 para números BR
 * - Retorna null se o número for curto demais / inválido (pra UI saber desabilitar o botão)
 */
export const buildWaURL = (phone: string | null | undefined, message?: string): string | null => {
  if (!phone) return null;
  const e164 = withCountryBR(phone);
  if (e164.length < 10) return null;
  const base = `https://wa.me/${e164}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

/**
 * Formata um telefone BR para exibição.
 * (11) 98765-4321 · (11) 8765-4321 · +55 (11) 98765-4321
 */
export const formatPhoneBR = (raw: string): string => {
  const d = normalizePhone(raw);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 13 && d.startsWith('55')) {
    return `+55 (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  }
  if (d.length === 12 && d.startsWith('55')) {
    return `+55 (${d.slice(2, 4)}) ${d.slice(4, 8)}-${d.slice(8)}`;
  }
  return raw;
};

/** Retorna true se o número dá pra usar no WhatsApp (celular BR ou internacional válido). */
export const isWhatsAppCapable = (phone: string | null | undefined): boolean => {
  return buildWaURL(phone) !== null;
};

/** Monta link de tel: pra chamada. */
export const buildTelURL = (phone: string | null | undefined): string | null => {
  if (!phone) return null;
  const e164 = withCountryBR(phone);
  if (e164.length < 10) return null;
  return `tel:+${e164}`;
};
