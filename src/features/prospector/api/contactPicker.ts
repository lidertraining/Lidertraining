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

function stripBOMAndControl(text: string): string {
  // Remove BOM UTF-8/UTF-16 e caracteres de controle no início
  return text.replace(/^[\uFEFF\u0000-\u001F\s]+/, '');
}

function looksLikeVCard(text: string): boolean {
  const clean = stripBOMAndControl(text);
  // Busca em um trecho maior (alguns exports têm headers antes)
  return /BEGIN\s*:\s*VCARD/i.test(clean.slice(0, 10000));
}

function hasVCFExtension(filename: string): boolean {
  if (!filename) return false;
  return /\.(vcf|vcard)$/i.test(filename);
}

function hasVCFMimeType(file: File): boolean {
  if (!file.type) return false;
  return /vcard|vcf|directory/i.test(file.type);
}

export function pickVCFFile(): Promise<VCFResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    // iOS Safari: accept ajuda o sistema a mostrar .vcf em "Arquivos"
    input.accept = '.vcf,.vcard,text/vcard,text/x-vcard,text/directory';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve({ ok: false, reason: 'no_file' });
        return;
      }
      try {
        // Lê como ArrayBuffer e decodifica explicitamente em UTF-8
        // (evita problemas de encoding no iOS Safari)
        const buffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const text = decoder.decode(buffer);

        // Validação em 3 camadas (qualquer uma passar = aceita)
        const byContent = looksLikeVCard(text);
        const byExtension = hasVCFExtension(file.name);
        const byMime = hasVCFMimeType(file);

        if (!byContent && !byExtension && !byMime) {
          // eslint-disable-next-line no-console
          console.warn('[pickVCFFile] rejected', {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            firstBytes: text.slice(0, 200),
          });
          resolve({ ok: false, reason: 'wrong_type' });
          return;
        }

        const cards = parseVCFRich(stripBOMAndControl(text));
        if (cards.length === 0) {
          resolve({ ok: false, reason: 'empty' });
          return;
        }
        resolve({ ok: true, cards });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[pickVCFFile] error', err);
        resolve({ ok: false, reason: 'wrong_type' });
      }
    };
    input.click();
  });
}

/** Re-export pra compat com imports antigos. */
export { parseVCFRich as parseVCF };
