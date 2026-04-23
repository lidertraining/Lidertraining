/**
 * Sistema unificado de importação de contatos.
 *
 * Consolida a lógica antes duplicada em:
 *   - src/features/prospector/api/contactPicker.ts (parseVCF)
 *   - src/components/SmartContactUploader.tsx (parseVCF)
 *
 * Features:
 *   - Parse VCF completo (RFC 6350) com line folding, quoted-printable, UTF-8
 *   - Extração rica: nome, apelido, todos os telefones (com tipo), emails, ORG,
 *     TITLE, BDAY, ADR, URL, NOTE, PHOTO, CATEGORIES, IMPP, X-SOCIALPROFILE
 *   - Análise por telefone: fixo/celular/serviço/inválido, DDD válido,
 *     adiciona o 9 automaticamente em celulares antigos BR
 *   - Filtragem configurável com estatísticas detalhadas
 *   - Sem limite de contatos (parser tolera até 10MB, processador sem limite)
 */

// ============================================================
// DADOS DE REFERÊNCIA
// ============================================================

/** DDDs válidos no Brasil (lista oficial ANATEL). */
const VALID_BR_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19,
  21, 22, 24, 27, 28,
  31, 32, 33, 34, 35, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48, 49,
  51, 53, 54, 55,
  61, 62, 63, 64, 65, 66, 67, 68, 69,
  71, 73, 74, 75, 77, 79,
  81, 82, 83, 84, 85, 86, 87, 88, 89,
  91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/** Palavras que indicam contato comercial / empresa. Case-insensitive. */
const BUSINESS_KEYWORDS = [
  'uber', 'ifood', '99app', 'rappi', 'cabify',
  'banco', 'itau', 'itaú', 'bradesco', 'santander', 'caixa', 'nubank', 'inter', 'c6',
  'ltda', ' s/a', ' s.a', ' sa ',
  'clinica', 'clínica', 'hospital', 'farmacia', 'farmácia',
  'correios', 'sedex',
  'sac ', 'atendimento',
  'delivery', 'motoboy', 'telentrega',
  'pizzaria', 'restaurante', 'lanchonete',
  'cartorio', 'cartório',
  'escola', 'colegio', 'colégio',
];

// ============================================================
// TIPOS
// ============================================================

export type PhoneKind = 'mobile' | 'landline' | 'service' | 'invalid';

export interface PhoneAnalysis {
  raw: string;
  normalized: string | null;       // E.164 sem + (ex: 5511987654321)
  kind: PhoneKind;
  isBrazilian: boolean;
  isWhatsAppCapable: boolean;      // true se kind==='mobile' e normalized válido
  wasFixed: boolean;               // true se tivemos que adicionar o 9
  reason?: string;
  typeLabels: string[];            // ['CELL','VOICE'] — do TEL do VCF
}

export interface VCFAddress {
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  label?: string;
  formatted: string;               // ex: "Rua X, 123 · São Paulo/SP"
}

export interface VCFSocialProfile {
  service?: string;                // Twitter, LinkedIn, Instagram, Facebook…
  url?: string;
  user?: string;
}

/** Payload completo do VCF, pré-análise. */
export interface ParsedVCardRich {
  name: string;                    // FN ou N reconstruído
  nickname?: string;               // NICKNAME
  phones: Array<{ value: string; types: string[] }>;
  emails: Array<{ value: string; types: string[] }>;
  organization?: string;           // ORG
  title?: string;                  // TITLE
  birthday?: string;               // BDAY (ISO date se possível)
  addresses: VCFAddress[];
  urls: string[];                  // URL(s)
  note?: string;                   // NOTE
  photo?: string;                  // PHOTO (base64 data url ou URL externa)
  categories: string[];            // CATEGORIES
  impps: Array<{ protocol: string; handle: string }>;
  socialProfiles: VCFSocialProfile[];
  relatedNames: Array<{ type: string; value: string }>; // X-ABRELATEDNAMES
  customDates: Array<{ label: string; date: string }>;  // X-ABDATE
  raw: string;                     // bloco vCard original (debug)
}

/** Contato processado pronto pra virar lead. */
export interface ProcessedContact {
  name: string;
  phone: string;                   // normalizado, pronto pra wa.me
  phoneRaw: string;                // original pra exibição
  email?: string;
  organization?: string;
  title?: string;
  birthday?: string;               // ISO date
  avatarUrl?: string;
  metadata: Record<string, unknown>; // resto do VCF (endereços, sociais, múltiplos fones, etc.)
  wasPhoneFixed: boolean;
}

export type FilterReason =
  | 'no_phone'
  | 'all_landline'
  | 'all_service'
  | 'all_invalid'
  | 'duplicate_in_import'
  | 'duplicate_in_database'
  | 'looks_like_business'
  | 'international'
  | 'no_name';

export interface FilteredItem {
  original: ParsedVCardRich;
  reason: FilterReason;
  details?: string;
}

export type FilterStats = Record<FilterReason, number> & {
  total: number;
  valid: number;
  fixed: number;
};

export interface ImportReport {
  valid: ProcessedContact[];
  filtered: FilteredItem[];
  stats: FilterStats;
}

export interface ImportOptions {
  includeNoName?: boolean;
  includeInternational?: boolean;
  includeBusinessLike?: boolean;
  /** Phones normalizados já existentes no banco — pra marcar como duplicate_in_database. */
  existingPhones?: Set<string>;
}

// ============================================================
// DECODIFICADORES VCF
// ============================================================

function unfold(text: string): string[] {
  const rawLines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const out: string[] = [];
  for (const line of rawLines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function decodeQuotedPrintable(text: string): string {
  return text.replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function fixEncoding(text: string): string {
  try {
    const bytes = new Uint8Array([...text].map((c) => c.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    if (/[áàâãéêíóôõúüç]/i.test(decoded) && !/Ã./.test(decoded)) return decoded;
  } catch {
    /* noop */
  }
  return text;
}

interface LineParsed {
  key: string;
  params: Record<string, string | string[]>;
  value: string;
}

function parseLine(line: string): LineParsed | null {
  const colonIdx = line.indexOf(':');
  if (colonIdx === -1) return null;
  const rawKey = line.slice(0, colonIdx);
  const rawValue = line.slice(colonIdx + 1);
  const parts = rawKey.split(';');
  const key = parts[0]?.toUpperCase() ?? '';
  const params: Record<string, string | string[]> = {};
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i] ?? '';
    const eqIdx = p.indexOf('=');
    if (eqIdx > -1) {
      const pk = p.slice(0, eqIdx).toUpperCase();
      const pv = p.slice(eqIdx + 1).toUpperCase();
      // TYPE pode aparecer múltiplas vezes (TYPE=CELL;TYPE=VOICE) ou como TYPE=CELL,VOICE
      if (pk === 'TYPE') {
        const existing = params[pk];
        const newValues = pv.split(',').map((s) => s.trim()).filter(Boolean);
        if (Array.isArray(existing)) params[pk] = [...existing, ...newValues];
        else if (typeof existing === 'string') params[pk] = [existing, ...newValues];
        else params[pk] = newValues;
      } else {
        params[pk] = pv;
      }
    } else {
      params[p.toUpperCase()] = 'TRUE';
    }
  }
  let value = rawValue;
  if (params['ENCODING'] === 'QUOTED-PRINTABLE') value = decodeQuotedPrintable(value);
  if (params['CHARSET'] === 'UTF-8') value = fixEncoding(value);
  return { key, params, value };
}

function getTypes(params: Record<string, string | string[]>): string[] {
  const t = params['TYPE'];
  if (!t) return [];
  return Array.isArray(t) ? t : [t];
}

// ============================================================
// PARSE VCF → ParsedVCardRich[]
// ============================================================

/** Parse um arquivo VCF inteiro (múltiplos cards) retornando payload rico. */
export function parseVCFRich(text: string): ParsedVCardRich[] {
  const cards: ParsedVCardRich[] = [];
  const sample = text.length > 10_000_000 ? text.slice(0, 10_000_000) : text;
  const blocks = sample.split(/BEGIN:VCARD/i).slice(1);

  for (const block of blocks) {
    const endIdx = block.search(/END:VCARD/i);
    if (endIdx === -1) continue;
    const cardBody = block.slice(0, endIdx);
    const lines = unfold(cardBody).filter((l) => l.trim().length > 0);

    let fn = '';
    let nStructured = '';
    let nickname: string | undefined;
    const phones: Array<{ value: string; types: string[] }> = [];
    const emails: Array<{ value: string; types: string[] }> = [];
    let organization: string | undefined;
    let title: string | undefined;
    let birthday: string | undefined;
    const addresses: VCFAddress[] = [];
    const urls: string[] = [];
    let note: string | undefined;
    let photo: string | undefined;
    const categories: string[] = [];
    const impps: Array<{ protocol: string; handle: string }> = [];
    const socialProfiles: VCFSocialProfile[] = [];
    const relatedNames: Array<{ type: string; value: string }> = [];
    const customDates: Array<{ label: string; date: string }> = [];

    for (const line of lines) {
      const parsed = parseLine(line);
      if (!parsed) continue;
      const { key, params, value } = parsed;

      switch (key) {
        case 'FN':
          fn = value.trim();
          break;
        case 'N': {
          const parts = value.split(';').map((s) => s.trim());
          // parts: [familyName, givenName, additionalNames, prefix, suffix]
          const given = parts[1] ?? '';
          const family = parts[0] ?? '';
          const combined = [given, family].filter(Boolean).join(' ').trim();
          if (combined) nStructured = combined;
          break;
        }
        case 'NICKNAME':
          nickname = value.trim() || undefined;
          break;
        case 'TEL': {
          const v = value.trim();
          if (v) phones.push({ value: v, types: getTypes(params) });
          break;
        }
        case 'EMAIL': {
          const v = value.trim();
          if (v) emails.push({ value: v, types: getTypes(params) });
          break;
        }
        case 'ORG':
          organization = value.split(';')[0]?.trim() || undefined;
          break;
        case 'TITLE':
          title = value.trim() || undefined;
          break;
        case 'BDAY': {
          const v = value.trim();
          // BDAY vem como "1990-05-15" ou "19900515" ou "--05-15" (sem ano)
          if (/^\d{4}-\d{2}-\d{2}/.test(v)) birthday = v.slice(0, 10);
          else if (/^\d{8}$/.test(v)) birthday = `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
          else if (/^--\d{2}-?\d{2}$/.test(v)) birthday = `1900-${v.slice(2, 4)}-${v.slice(-2)}`;
          break;
        }
        case 'ADR': {
          // ADR: po-box;extended;street;city;region;postal-code;country
          const parts = value.split(';').map((s) => s.trim());
          const street = parts[2];
          const city = parts[3];
          const region = parts[4];
          const postalCode = parts[5];
          const country = parts[6];
          const pieces = [street, city, region, country].filter(Boolean);
          if (pieces.length > 0) {
            const typesArr = getTypes(params);
            addresses.push({
              ...(street ? { street } : {}),
              ...(city ? { city } : {}),
              ...(region ? { region } : {}),
              ...(postalCode ? { postalCode } : {}),
              ...(country ? { country } : {}),
              ...(typesArr[0] ? { label: typesArr[0] } : {}),
              formatted: pieces.join(' · '),
            });
          }
          break;
        }
        case 'URL': {
          const v = value.trim();
          if (v) urls.push(v);
          break;
        }
        case 'NOTE':
          note = value.trim() || undefined;
          break;
        case 'PHOTO': {
          const v = value.trim();
          if (v) {
            if (v.startsWith('http')) photo = v;
            else if (params['ENCODING'] === 'B' || params['ENCODING'] === 'BASE64') {
              const mime = (params['TYPE'] as string | undefined) ?? 'JPEG';
              photo = `data:image/${mime.toLowerCase()};base64,${v}`;
            } else {
              photo = v;
            }
          }
          break;
        }
        case 'CATEGORIES': {
          value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .forEach((c) => categories.push(c));
          break;
        }
        case 'IMPP': {
          // ex: IMPP;X-SERVICE-TYPE=WhatsApp:xmpp:5511987654321@whatsapp.com
          const match = value.match(/^([a-z]+):(.+)$/i);
          if (match && match[1] && match[2]) {
            impps.push({ protocol: match[1], handle: match[2] });
          }
          break;
        }
        case 'X-SOCIALPROFILE': {
          const service = (params['TYPE'] as string | undefined) ?? (params['X-USER'] as string | undefined);
          socialProfiles.push({
            ...(service ? { service } : {}),
            ...(value.trim() ? { url: value.trim() } : {}),
            ...((params['X-USER'] as string | undefined) ? { user: params['X-USER'] as string } : {}),
          });
          break;
        }
        case 'X-ABRELATEDNAMES': {
          const label = (params['TYPE'] as string | undefined) ?? 'other';
          relatedNames.push({ type: label, value: value.trim() });
          break;
        }
        case 'X-ABDATE': {
          const label = (params['TYPE'] as string | undefined) ?? 'custom';
          customDates.push({ label, date: value.trim() });
          break;
        }
        default:
          break;
      }
    }

    const name = fn || nStructured || '';
    cards.push({
      name,
      ...(nickname ? { nickname } : {}),
      phones,
      emails,
      ...(organization ? { organization } : {}),
      ...(title ? { title } : {}),
      ...(birthday ? { birthday } : {}),
      addresses,
      urls,
      ...(note ? { note } : {}),
      ...(photo ? { photo } : {}),
      categories,
      impps,
      socialProfiles,
      relatedNames,
      customDates,
      raw: cardBody,
    });
  }

  return cards;
}

// ============================================================
// ANÁLISE DE TELEFONE
// ============================================================

export function analyzePhone(raw: string, types: string[] = []): PhoneAnalysis {
  const base: PhoneAnalysis = {
    raw: raw ?? '',
    normalized: null,
    kind: 'invalid',
    isBrazilian: false,
    isWhatsAppCapable: false,
    wasFixed: false,
    typeLabels: types,
  };
  const cleanRaw = (raw ?? '').trim();
  if (!cleanRaw) return { ...base, reason: 'empty' };

  let digits = cleanRaw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length > 11) digits = digits.slice(1);

  if (digits.length < 8) return { ...base, reason: 'too_short' };
  if (/^(\d)\1+$/.test(digits)) return { ...base, reason: 'repeated' };
  if (digits === '1234567890' || digits === '0123456789') return { ...base, reason: 'sequential' };

  if (/^(0800|0300|0900|3003|4004|4003|4020|4002)/.test(digits)) {
    return { ...base, kind: 'service', isBrazilian: true, reason: 'service_number' };
  }

  const hasCC = digits.startsWith('55') && (digits.length === 12 || digits.length === 13);
  const noCC = !digits.startsWith('55') && (digits.length === 10 || digits.length === 11);

  // Internacional (não-BR)
  if (!hasCC && !noCC) {
    if (digits.length >= 11 && digits.length <= 15) {
      return { ...base, normalized: digits, kind: 'mobile', isBrazilian: false, isWhatsAppCapable: true };
    }
    return { ...base, reason: 'unrecognized_format' };
  }

  if (noCC) digits = '55' + digits;

  const ddd = parseInt(digits.slice(2, 4), 10);
  if (!VALID_BR_DDDS.has(ddd)) {
    return { ...base, isBrazilian: true, reason: 'invalid_ddd' };
  }

  const subscriberPart = digits.slice(4);
  const first = subscriberPart[0] ?? '';

  // 12 dígitos (55 + DDD + 8) → fixo OU celular antigo sem o 9
  if (digits.length === 12) {
    if (['2', '3', '4', '5'].includes(first)) {
      return { ...base, kind: 'landline', isBrazilian: true, reason: 'landline' };
    }
    if (['6', '7', '8', '9'].includes(first)) {
      const fixed = digits.slice(0, 4) + '9' + digits.slice(4);
      return {
        ...base,
        kind: 'mobile',
        isBrazilian: true,
        normalized: fixed,
        isWhatsAppCapable: true,
        wasFixed: true,
      };
    }
    return { ...base, isBrazilian: true, reason: 'invalid_number' };
  }

  // 13 dígitos (55 + DDD + 9 + 8) → celular atual
  if (digits.length === 13) {
    if (first !== '9') {
      return { ...base, isBrazilian: true, reason: 'mobile_must_start_with_9' };
    }
    return { ...base, kind: 'mobile', isBrazilian: true, normalized: digits, isWhatsAppCapable: true };
  }

  return { ...base, reason: 'unexpected_length' };
}

/**
 * Escolhe o melhor telefone entre vários do mesmo contato.
 * Prioridade:
 *   1. mobile BR com TYPE=CELL
 *   2. mobile BR (qualquer tipo)
 *   3. mobile internacional
 *   4. qualquer mobile válido
 *   5. null (nenhum capaz de WhatsApp)
 */
export function pickBestPhone(
  phones: Array<{ value: string; types: string[] }>,
): PhoneAnalysis | null {
  if (!phones?.length) return null;
  const analyses = phones.map((p) => analyzePhone(p.value, p.types));

  const isCellTyped = (a: PhoneAnalysis) =>
    a.typeLabels.some((t) => t.includes('CELL') || t.includes('MOBILE'));

  const mobileBRCell = analyses.find(
    (a) => a.kind === 'mobile' && a.isBrazilian && isCellTyped(a),
  );
  if (mobileBRCell) return mobileBRCell;

  const mobileBR = analyses.find((a) => a.kind === 'mobile' && a.isBrazilian);
  if (mobileBR) return mobileBR;

  const mobileIntl = analyses.find((a) => a.kind === 'mobile' && !a.isBrazilian);
  if (mobileIntl) return mobileIntl;

  return analyses[0] ?? null;
}

// ============================================================
// HEURÍSTICAS
// ============================================================

export function looksLikeBusiness(name: string): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return BUSINESS_KEYWORDS.some((kw) => lower.includes(kw));
}

export function toTitleCase(name: string): string {
  return name
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length > 2 ? (w[0]?.toUpperCase() ?? '') + w.slice(1) : w))
    .join(' ')
    .trim();
}

// ============================================================
// PROCESSADOR PRINCIPAL
// ============================================================

export function processContacts(
  cards: ParsedVCardRich[],
  options: ImportOptions = {},
): ImportReport {
  const {
    includeNoName = true,
    includeInternational = false,
    includeBusinessLike = false,
    existingPhones = new Set<string>(),
  } = options;

  const valid: ProcessedContact[] = [];
  const filtered: FilteredItem[] = [];
  const seenInImport = new Set<string>();

  const stats: FilterStats = {
    total: cards.length,
    valid: 0,
    fixed: 0,
    no_phone: 0,
    all_landline: 0,
    all_service: 0,
    all_invalid: 0,
    duplicate_in_import: 0,
    duplicate_in_database: 0,
    looks_like_business: 0,
    international: 0,
    no_name: 0,
  };

  for (const card of cards) {
    // 1. Sem telefone algum
    if (!card.phones.length) {
      filtered.push({ original: card, reason: 'no_phone' });
      stats.no_phone++;
      continue;
    }

    // 2. Analisa os telefones e escolhe o melhor
    const analyses = card.phones.map((p) => analyzePhone(p.value, p.types));
    const best = pickBestPhone(card.phones);

    if (!best || !best.isWhatsAppCapable) {
      if (analyses.every((a) => a.kind === 'landline')) {
        filtered.push({ original: card, reason: 'all_landline' });
        stats.all_landline++;
      } else if (analyses.every((a) => a.kind === 'service')) {
        filtered.push({ original: card, reason: 'all_service' });
        stats.all_service++;
      } else {
        filtered.push({
          original: card,
          reason: 'all_invalid',
          ...(analyses[0]?.reason ? { details: analyses[0].reason } : {}),
        });
        stats.all_invalid++;
      }
      continue;
    }

    // 3. Internacional
    if (!best.isBrazilian && !includeInternational) {
      filtered.push({ original: card, reason: 'international' });
      stats.international++;
      continue;
    }

    // 4. Já existe no banco
    if (existingPhones.has(best.normalized!)) {
      filtered.push({ original: card, reason: 'duplicate_in_database' });
      stats.duplicate_in_database++;
      continue;
    }

    // 5. Duplicado dentro do próprio VCF
    if (seenInImport.has(best.normalized!)) {
      filtered.push({ original: card, reason: 'duplicate_in_import' });
      stats.duplicate_in_import++;
      continue;
    }

    // 6. Sem nome
    const hasName = !!(card.name && card.name.trim());
    if (!hasName && !includeNoName) {
      filtered.push({ original: card, reason: 'no_name' });
      stats.no_name++;
      continue;
    }

    // 7. Parece empresa
    const nameClean = hasName ? toTitleCase(card.name) : 'Sem nome';
    if (hasName && looksLikeBusiness(card.name) && !includeBusinessLike) {
      filtered.push({ original: card, reason: 'looks_like_business' });
      stats.looks_like_business++;
      continue;
    }

    // ✅ Passou todos os filtros
    seenInImport.add(best.normalized!);
    if (best.wasFixed) stats.fixed++;

    // Metadata rica com TUDO que o VCF trouxe
    const metadata: Record<string, unknown> = {};
    if (card.nickname) metadata.nickname = card.nickname;
    if (card.phones.length > 1) metadata.allPhones = card.phones;
    if (card.emails.length > 1) metadata.allEmails = card.emails;
    if (card.addresses.length) metadata.addresses = card.addresses;
    if (card.urls.length) metadata.urls = card.urls;
    if (card.categories.length) metadata.categories = card.categories;
    if (card.impps.length) metadata.impps = card.impps;
    if (card.socialProfiles.length) metadata.socialProfiles = card.socialProfiles;
    if (card.relatedNames.length) metadata.relatedNames = card.relatedNames;
    if (card.customDates.length) metadata.customDates = card.customDates;
    if (card.note) metadata.originalNote = card.note;

    valid.push({
      name: nameClean,
      phone: best.normalized!,
      phoneRaw: best.raw,
      ...(card.emails[0]?.value ? { email: card.emails[0].value.trim() } : {}),
      ...(card.organization ? { organization: card.organization } : {}),
      ...(card.title ? { title: card.title } : {}),
      ...(card.birthday ? { birthday: card.birthday } : {}),
      ...(card.photo ? { avatarUrl: card.photo } : {}),
      metadata,
      wasPhoneFixed: best.wasFixed,
    });
  }

  stats.valid = valid.length;
  return { valid, filtered, stats };
}

// ============================================================
// HELPERS DE URL (re-exports pra conveniência)
// ============================================================

export { buildWaURL } from './phone';
