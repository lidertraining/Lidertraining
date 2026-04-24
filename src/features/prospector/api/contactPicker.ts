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

      // === MODO DIAGNÓSTICO ===
      // Coleta informações do arquivo ANTES de validar
      const fileName = file.name || '(sem nome)';
      const fileType = file.type || '(sem mime)';
      const fileSize = file.size;

      try {
        const buffer = await file.arrayBuffer();
        const decoder = new TextDecoder('utf-8', { fatal: false });
        const text = decoder.decode(buffer);

        // Primeiros bytes em HEX (pra ver BOM e encoding)
        const firstBytes = new Uint8Array(buffer.slice(0, 32));
        const hexBytes = Array.from(firstBytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ');

        // Primeiros chars visíveis
        const first200Chars = text.slice(0, 200);

        // Busca por BEGIN:VCARD em qualquer lugar do arquivo
        const hasBeginAnywhere = /BEGIN\s*:\s*VCARD/i.test(text);
        const hasBeginInFirst10k = /BEGIN\s*:\s*VCARD/i.test(text.slice(0, 10000));

        // MOSTRA TUDO NUM ALERT (vai aparecer na tela do iPhone)
        const report = [
          `📋 DIAGNÓSTICO VCF`,
          ``,
          `Nome: ${fileName}`,
          `MIME: ${fileType}`,
          `Tamanho: ${fileSize} bytes`,
          ``,
          `Primeiros 32 bytes (hex):`,
          hexBytes,
          ``,
          `Primeiros 200 chars:`,
          first200Chars || '(vazio)',
          ``,
          `Tem BEGIN:VCARD em qualquer lugar? ${hasBeginAnywhere ? '✅ SIM' : '❌ NÃO'}`,
          `Tem nos primeiros 10k chars? ${hasBeginInFirst10k ? '✅ SIM' : '❌ NÃO'}`,
        ].join('\n');

        alert(report);

        // Ainda tenta parsear e retornar, mesmo em diagnóstico
        if (hasBeginAnywhere) {
          const stripped = text.replace(/^[\uFEFF\u0000-\u001F\s]+/, '');
          const cards = parseVCFRich(stripped);
          if (cards.length === 0) {
            alert(`⚠️ BEGIN:VCARD encontrado mas parseVCFRich retornou 0 cards.\n\nPode ser problema no parser.`);
            resolve({ ok: false, reason: 'empty' });
            return;
          }
          alert(`✅ Sucesso! ${cards.length} cartões parseados. Seguindo pro preview.`);
          resolve({ ok: true, cards });
          return;
        }

        resolve({ ok: false, reason: 'wrong_type' });
      } catch (err) {
        alert(`❌ Erro ao ler arquivo:\n${err instanceof Error ? err.message : String(err)}`);
        resolve({ ok: false, reason: 'wrong_type' });
      }
    };
    input.click();
  });
}

/** Re-export pra compat com imports antigos. */
export { parseVCFRich as parseVCF };
