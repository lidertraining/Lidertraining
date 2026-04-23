/**
 * Contact Picker API (Chrome Android) + fallback .vcf robusto.
 * Parsing delegado pra @lib/contacts-import (parser unificado).
 * Mantém API pública: hasContactPicker, pickContacts, pickVCFFile, parseVCF.
 */

import { parseVCFRich, type ParsedVCardRich } from '@lib/contacts-import';

/** Shape legada — mantida pra compat com código antigo que dependia dela. */
export interface PickedContact {
  name: string;
  phone: string | null;
}

export type VCFResult =
  | { ok: true; cards: ParsedVCardRich[] }
  | { ok: false; reason: 'no_file' | 'wrong_type' | 'empty' };

export function hasContactPicker(): boolean {
  return 'contacts' in navigator && 'ContactsManager' in window;
}

/** Android Chrome: seletor nativo. Retorna forma rica pra integrar ao preview. */
export async function pickContactsRich(): Promise<ParsedVCardRich[]> {
  if (!hasContactPicker()) return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    const results: Array<{ name?: string[]; tel?: string[]; email?: string[] }> =
      await nav.contacts.select(['name', 'tel', 'email'], { multiple: true });
    return results.map((c) => ({
      name: c.name?.[0] ?? '',
      phones: (c.tel ?? []).map((value) => ({ value, types: ['CELL'] })),
      emails: (c.email ?? []).map((value) => ({ value, types: [] })),
      addresses: [],
      urls: [],
      categories: [],
      impps: [],
      socialProfiles: [],
      relatedNames: [],
      customDates: [],
      raw: '',
    }));
  } catch {
    return [];
  }
}

/** Compat: shape legado usado por SmartContactUploader antigo. */
export async function pickContacts(): Promise<PickedContact[]> {
  const rich = await pickContactsRich();
  return rich
    .map((c) => ({ name: c.name || 'Sem nome', phone: c.phones[0]?.value ?? null }))
    .filter((c) => !!c.phone);
}

/**
 * Lê o arquivo UMA ÚNICA VEZ e tenta decodificar em UTF-8, UTF-16LE ou UTF-16BE.
 * Detecta BOM automaticamente. iPhone Safari tem bug onde chamar .text() e
 * depois .arrayBuffer() no mesmo File pode quebrar o stream.
 */
async function readContactFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);

  const hasUtf16LeBom = bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe;
  const hasUtf16BeBom = bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff;
  const hasUtf8Bom =
    bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;

  if (hasUtf16LeBom) return new TextDecoder('utf-16le').decode(buf);
  if (hasUtf16BeBom) return new TextDecoder('utf-16be').decode(buf);
  if (hasUtf8Bom) return new TextDecoder('utf-8').decode(buf).replace(/^\uFEFF/, '');

  // Sem BOM: tenta UTF-8
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(buf);
  if (/BEGIN:VCARD/i.test(utf8)) return utf8;

  // Último recurso: UTF-16LE sem BOM (Windows exports)
  try {
    const utf16 = new TextDecoder('utf-16le', { fatal: false }).decode(buf);
    if (/BEGIN:VCARD/i.test(utf16)) return utf16;
  } catch {
    /* noop */
  }
  return utf8;
}

/** Abre seletor de arquivo e parseia o VCF selecionado. */
export function pickVCFFile(): Promise<VCFResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve({ ok: false, reason: 'no_file' });
        return;
      }
      try {
        const text = await readContactFile(file);
        const cards = parseVCFRich(text);
        if (cards.length === 0) {
          resolve({ ok: false, reason: 'empty' });
          return;
        }
        resolve({ ok: true, cards });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[pickVCFFile] erro ao ler/parsear:', err, {
          name: file.name,
          size: file.size,
          type: file.type,
        });
        resolve({ ok: false, reason: 'wrong_type' });
      }
    };
    input.click();
  });
}

/** Re-export pra compat com imports antigos. */
export { parseVCFRich as parseVCF };
