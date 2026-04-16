/**
 * Normaliza telefone: mantém apenas dígitos.
 * Ex: "(11) 98765-4321" -> "11987654321"
 */
export const normalizePhone = (raw: string): string => raw.replace(/\D/g, '');

/**
 * Garante prefixo de país 55 (BR) se vier sem DDI.
 */
export const withCountryBR = (digits: string): string => {
  const d = normalizePhone(digits);
  if (d.length === 0) return '';
  if (d.startsWith('55') && d.length >= 12) return d;
  return `55${d}`;
};

/**
 * URL para abrir conversa direta no WhatsApp.
 */
export const buildWaURL = (phone: string, message?: string): string => {
  const e164 = withCountryBR(phone);
  const base = `https://wa.me/${e164}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

/**
 * Formata para exibição: "(11) 98765-4321" ou "+55 11 98765-4321".
 */
export const formatPhoneBR = (raw: string): string => {
  const d = normalizePhone(raw);
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  if (d.length === 13 && d.startsWith('55')) {
    return `+55 (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  }
  return raw;
};
