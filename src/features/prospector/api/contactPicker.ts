/**
 * Contact Picker API (Chrome Android) + fallback .vcf robusto.
 * Parsing delegado pra @lib/contacts-import (parser unificado).
 * Mantém API pública: hasContactPicker, pickContacts, pickVCFFile, parseVCF.
 */

import { parseVCFRich, parseVCFResilient, type ParsedVCardRich } from '@lib/contacts-import';

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

/** Remove BOM e caracteres de controle do início do texto. */
function stripLeadingNoise(text: string): string {
  return text.replace(/^[\uFEFF\u0000-\u001F\s]+/, '');
}

/**
 * Abre seletor de arquivo e parseia o VCF selecionado.
 * Fluxo direto, sem validação intermediária: lê arquivoBuffer → UTF-8 →
 * passa pro parser. Se voltar 0 cards, retorna 'empty'.
 * O parser é tolerante a formatos estranhos; fica a cargo dele decidir.
 */
export function pickVCFFile(): Promise<VCFResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.vcf,.vcard,text/vcard,text/x-vcard,text/directory,*/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve({ ok: false, reason: 'no_file' });
        return;
      }
      try {
        const buffer = await file.arrayBuffer();
        const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
        const cards = parseVCFResilient(stripLeadingNoise(text));
        if (cards.length === 0) {
          resolve({ ok: false, reason: 'empty' });
          return;
        }
        resolve({ ok: true, cards });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[pickVCFFile] erro ao ler arquivo', err, {
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
