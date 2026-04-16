/**
 * Contact Picker API (Chrome Android) + fallback .vcf.
 *
 * - Android Chrome: abre seletor nativo de contatos do celular
 * - Outros: oferece upload de arquivo .vcf (vCard)
 */

export interface PickedContact {
  name: string;
  phone: string | null;
}

/** Detecta se a Contact Picker API está disponível (Chrome Android). */
export function hasContactPicker(): boolean {
  return 'contacts' in navigator && 'ContactsManager' in window;
}

/** Abre o seletor nativo de contatos. Retorna array de contatos escolhidos. */
export async function pickContacts(): Promise<PickedContact[]> {
  if (!hasContactPicker()) return [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    const results = await nav.contacts.select(['name', 'tel'], { multiple: true });

    return results.map((c: { name?: string[]; tel?: string[] }) => ({
      name: c.name?.[0] ?? 'Sem nome',
      phone: c.tel?.[0] ?? null,
    }));
  } catch {
    return [];
  }
}

/** Parseia um arquivo .vcf (vCard) e retorna contatos extraídos. */
export function parseVCF(text: string): PickedContact[] {
  const contacts: PickedContact[] = [];
  const cards = text.split('BEGIN:VCARD');

  for (const card of cards) {
    if (!card.includes('END:VCARD')) continue;

    let name = '';
    let phone: string | null = null;

    const lines = card.split('\n').map((l) => l.trim());
    for (const line of lines) {
      if (line.startsWith('FN:') || line.startsWith('FN;')) {
        name = line.split(':').slice(1).join(':').trim();
      }
      if (line.startsWith('TEL') && !phone) {
        phone = line.split(':').slice(1).join(':').replace(/[^0-9+]/g, '').trim() || null;
      }
    }

    if (name) {
      contacts.push({ name, phone });
    }
  }

  return contacts;
}

/** Abre file picker para .vcf e retorna contatos parseados. */
export function pickVCFFile(): Promise<PickedContact[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.vcf,.vcard';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve([]);
        return;
      }
      const text = await file.text();
      resolve(parseVCF(text));
    };
    input.click();
  });
}
