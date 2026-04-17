/**
 * Contact Picker API (Chrome Android) + fallback .vcf robusto.
 *
 * - Android Chrome: seletor nativo de contatos
 * - Outros: upload de arquivo .vcf com parser resiliente
 *
 * O picker de arquivo NÃO usa `accept` — isso força o iOS/Android a abrir o
 * file manager em vez de galeria de fotos. Validação é feita pós-seleção
 * (por extensão e conteúdo BEGIN:VCARD).
 */

export interface PickedContact {
  name: string;
  phone: string | null;
}

export type VCFResult =
  | { ok: true; contacts: PickedContact[] }
  | { ok: false; reason: 'no_file' | 'wrong_type' | 'empty' };

export function hasContactPicker(): boolean {
  return 'contacts' in navigator && 'ContactsManager' in window;
}

export async function pickContacts(): Promise<PickedContact[]> {
  if (!hasContactPicker()) return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    const results = await nav.contacts.select(['name', 'tel'], { multiple: true });
    return results
      .map((c: { name?: string[]; tel?: string[] }) => ({
        name: c.name?.[0] ?? 'Sem nome',
        phone: c.tel?.[0] ?? null,
      }))
      .filter((c: PickedContact) => !!c.phone);
  } catch {
    return [];
  }
}

/* ────────────── vCard parser robusto ────────────── */

/**
 * Unfolds linhas vCard: linhas que começam com espaço ou tab são continuações
 * da linha anterior (quebra obrigatória a cada 75 chars no padrão vCard).
 */
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

/** Decodifica quoted-printable (usado por Outlook/iCloud com acentos). */
function decodeQuotedPrintable(text: string): string {
  return text.replace(/=([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
}

/** Tenta decodificar UTF-8 bytes que vieram como latin1. */
function fixEncoding(text: string): string {
  try {
    // Se a string tem bytes UTF-8 interpretados como latin1, re-decoda
    const bytes = new Uint8Array([...text].map((c) => c.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    // Heurística: se o decoded tem caracteres acentuados comuns, usa ele
    if (/[áàâãéêíóôõúüç]/i.test(decoded) && !/Ã./.test(decoded)) return decoded;
  } catch {
    /* noop */
  }
  return text;
}

/** Parse do valor de uma linha vCard: separa params do valor e decoda. */
function parseLineValue(line: string): { params: Record<string, string>; value: string } {
  const colonIdx = line.indexOf(':');
  if (colonIdx === -1) return { params: {}, value: '' };

  const rawKey = line.slice(0, colonIdx);
  const rawValue = line.slice(colonIdx + 1);

  const parts = rawKey.split(';');
  const params: Record<string, string> = {};
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i]!;
    const eqIdx = p.indexOf('=');
    if (eqIdx > -1) {
      params[p.slice(0, eqIdx).toUpperCase()] = p.slice(eqIdx + 1).toUpperCase();
    } else {
      params[p.toUpperCase()] = 'TRUE';
    }
  }

  let value = rawValue;
  if (params['ENCODING'] === 'QUOTED-PRINTABLE') {
    value = decodeQuotedPrintable(value);
  }
  if (params['CHARSET'] === 'UTF-8') {
    value = fixEncoding(value);
  }

  return { params, value };
}

/** Normaliza telefone: mantém só dígitos e +. Retorna null se menos que 8 chars. */
function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[^0-9+]/g, '');
  return cleaned.length >= 8 ? cleaned : null;
}

/** Extrai nome do vCard. Prefere FN; fallback pra N (family;given). */
function extractName(lines: string[]): string {
  let fn = '';
  let n = '';

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper.startsWith('FN:') || upper.startsWith('FN;')) {
      fn = parseLineValue(line).value.trim();
      if (fn) return fn;
    } else if (upper.startsWith('N:') || upper.startsWith('N;')) {
      const { value } = parseLineValue(line);
      // N: family;given;middle;prefix;suffix
      const parts = value.split(';').map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        n = `${parts[1]} ${parts[0]}`.trim();
      } else if (parts.length === 1) {
        n = parts[0]!;
      }
    }
  }

  return fn || n || '';
}

/**
 * Extrai o melhor telefone: prefere CELL/MOBILE > VOICE > qualquer TEL.
 * Retorna só dígitos (pronto pra wa.me).
 */
function extractBestPhone(lines: string[]): string | null {
  const tels: { phone: string; priority: number }[] = [];

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (!upper.startsWith('TEL')) continue;

    const { params, value } = parseLineValue(line);
    const phone = normalizePhone(value);
    if (!phone) continue;

    const type = params['TYPE'] ?? '';
    let priority = 5;
    if (type.includes('CELL') || type.includes('MOBILE')) priority = 1;
    else if (type.includes('VOICE')) priority = 3;

    tels.push({ phone, priority });
  }

  if (tels.length === 0) return null;
  tels.sort((a, b) => a.priority - b.priority);
  return tels[0]!.phone;
}

/** Parseia um .vcf (1 ou N vCards) e retorna contatos válidos. */
export function parseVCF(text: string): PickedContact[] {
  const contacts: PickedContact[] = [];

  // Protege contra arquivos gigantes: limita a 10MB
  const sample = text.length > 10_000_000 ? text.slice(0, 10_000_000) : text;

  // Split por vCard individual
  const blocks = sample.split(/BEGIN:VCARD/i).slice(1);

  for (const block of blocks) {
    const endIdx = block.search(/END:VCARD/i);
    if (endIdx === -1) continue;

    const cardBody = block.slice(0, endIdx);
    const lines = unfold(cardBody).filter((l) => l.trim().length > 0);

    const name = extractName(lines);
    const phone = extractBestPhone(lines);

    if (name) {
      contacts.push({ name, phone });
    }
  }

  return contacts;
}

/* ────────────── File picker ────────────── */

/** Valida se o conteúdo parece um vCard (contém BEGIN:VCARD). */
function looksLikeVCard(text: string): boolean {
  return /BEGIN:VCARD/i.test(text.slice(0, 2000));
}

/** Valida se o nome do arquivo é .vcf/.vcard. */
function hasVCFExtension(filename: string): boolean {
  return /\.(vcf|vcard)$/i.test(filename);
}

/**
 * Abre file picker SEM restringir MIME.
 * Isso força iOS/Android a mostrarem o file manager (Arquivos / Drive / Downloads)
 * em vez da galeria de fotos — galeria só aparece quando MIME inclui image/*.
 *
 * Valida o arquivo pós-seleção por extensão OU conteúdo.
 */
export function pickVCFFile(): Promise<VCFResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    // SEM accept = abre file manager completo em todos os dispositivos
    // Validação é feita depois
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve({ ok: false, reason: 'no_file' });
        return;
      }

      try {
        const text = await file.text();

        if (!looksLikeVCard(text) && !hasVCFExtension(file.name)) {
          resolve({ ok: false, reason: 'wrong_type' });
          return;
        }

        const contacts = parseVCF(text);
        if (contacts.length === 0) {
          resolve({ ok: false, reason: 'empty' });
          return;
        }

        resolve({ ok: true, contacts });
      } catch {
        resolve({ ok: false, reason: 'wrong_type' });
      }
    };
    input.click();
  });
}
