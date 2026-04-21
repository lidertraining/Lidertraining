import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { useToast } from '@shared/hooks/useToast';
import { useCreateLead } from '@features/prospector/hooks/useLeads';
import { cn } from '@lib/cn';

/* ═══════════════════════════════════════════════════════════════════
 * Tipos públicos
 * ═══════════════════════════════════════════════════════════════════ */

export interface SmartContact {
  name: string;
  phone: string | null;
}

export interface ExistingContactLike {
  name: string;
  phone?: string | null;
}

export interface SmartContactUploaderProps {
  context: 'fir' | 'jornada';
  existingContacts: ExistingContactLike[];
  onImport?: (imported: SmartContact[]) => void;
  sourceLabel?: string;
  className?: string;
}

/* ═══════════════════════════════════════════════════════════════════
 * Detecção de plataforma
 * ═══════════════════════════════════════════════════════════════════ */

type Platform = 'android' | 'ios' | 'desktop';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  return 'desktop';
}

function hasContactPicker(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'contacts' in navigator &&
    typeof window !== 'undefined' &&
    'ContactsManager' in window
  );
}

/**
 * Detecta navegadores Android que NÃO suportam Contact Picker.
 * Samsung Internet, Firefox Mobile, Mi Browser e similares — todos
 * baseados em engines não-Chromium ou em forks que não implementam
 * a Contact Picker API.
 */
function isAndroidWithoutPicker(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (!/android/i.test(ua)) return false;
  return !hasContactPicker();
}

/**
 * Gera URL de Android Intent que força o Chrome a abrir a página atual.
 * Funciona em Samsung Internet, Firefox Mobile e qualquer outro
 * navegador Android. Se Chrome não estiver instalado, o navegador
 * abre o link normal (fallback transparente).
 */
function buildOpenInChromeIntent(): string {
  const url = window.location.href;
  // Remove protocolo pra montar o intent
  const stripped = url.replace(/^https?:\/\//, '');
  return `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`;
}

/* ═══════════════════════════════════════════════════════════════════
 * Contact Picker API (Android Chrome)
 * ═══════════════════════════════════════════════════════════════════ */

async function pickNativeContacts(): Promise<SmartContact[]> {
  if (!hasContactPicker()) return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    const results = await nav.contacts.select(['name', 'tel'], { multiple: true });
    return results
      .map((c: { name?: string[]; tel?: string[] }) => ({
        name: (c.name?.[0] ?? '').trim() || 'Sem nome',
        phone: c.tel?.[0] ?? null,
      }))
      .filter((c: SmartContact) => !!c.name);
  } catch {
    return [];
  }
}

/* ═══════════════════════════════════════════════════════════════════
 * VCF parser robusto
 * ─ line folding (RFC 6350) + QUOTED-PRINTABLE + CHARSET=UTF-8 (dupla)
 * ─ multi vCards num único arquivo
 * ═══════════════════════════════════════════════════════════════════ */

function unfoldVCF(text: string): string[] {
  const raw = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const out: string[] = [];
  for (const line of raw) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function decodeQuotedPrintable(text: string): string {
  return text
    .replace(/=\r?\n/g, '')
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function fixUTF8Latin1(text: string): string {
  try {
    const bytes = new Uint8Array([...text].map((c) => c.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    if (/[áàâãéêíóôõúüç]/i.test(decoded) && !/Ã./.test(decoded)) return decoded;
  } catch {
    /* noop */
  }
  return text;
}

interface VCFLineParsed {
  params: Record<string, string>;
  value: string;
}

function parseVCFLine(line: string): VCFLineParsed {
  const idx = line.indexOf(':');
  if (idx === -1) return { params: {}, value: '' };
  const rawKey = line.slice(0, idx);
  const rawVal = line.slice(idx + 1);

  const parts = rawKey.split(';');
  const params: Record<string, string> = {};
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i]!;
    const eq = p.indexOf('=');
    if (eq > -1) {
      params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1).toUpperCase();
    } else {
      params[p.toUpperCase()] = 'TRUE';
    }
  }

  let value = rawVal;
  if (params['ENCODING'] === 'QUOTED-PRINTABLE') value = decodeQuotedPrintable(value);
  if (params['CHARSET'] === 'UTF-8') value = fixUTF8Latin1(value);
  return { params, value };
}

function extractVCFName(lines: string[]): string {
  let fn = '';
  let n = '';
  for (const line of lines) {
    const u = line.toUpperCase();
    if (u.startsWith('FN:') || u.startsWith('FN;')) {
      fn = parseVCFLine(line).value.trim();
      if (fn) return fn;
    } else if (u.startsWith('N:') || u.startsWith('N;')) {
      const { value } = parseVCFLine(line);
      const parts = value.split(';').map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) n = `${parts[1]} ${parts[0]}`.trim();
      else if (parts.length === 1) n = parts[0]!;
    }
  }
  return fn || n || '';
}

function extractVCFPhone(lines: string[]): string | null {
  const tels: Array<{ phone: string; priority: number }> = [];
  for (const line of lines) {
    const u = line.toUpperCase();
    if (!u.startsWith('TEL')) continue;
    const { params, value } = parseVCFLine(line);
    const cleaned = value.replace(/[^0-9+]/g, '');
    if (cleaned.length < 8) continue;
    const type = params['TYPE'] ?? '';
    let priority = 5;
    if (type.includes('CELL') || type.includes('MOBILE')) priority = 1;
    else if (type.includes('VOICE')) priority = 3;
    tels.push({ phone: cleaned, priority });
  }
  if (!tels.length) return null;
  tels.sort((a, b) => a.priority - b.priority);
  return tels[0]!.phone;
}

export function parseVCF(text: string): SmartContact[] {
  const contacts: SmartContact[] = [];
  const sample = text.length > 10_000_000 ? text.slice(0, 10_000_000) : text;
  const blocks = sample.split(/BEGIN:VCARD/i).slice(1);
  for (const block of blocks) {
    const end = block.search(/END:VCARD/i);
    if (end === -1) continue;
    const body = block.slice(0, end);
    const lines = unfoldVCF(body).filter((l) => l.trim().length > 0);
    const name = extractVCFName(lines);
    const phone = extractVCFPhone(lines);
    if (name) contacts.push({ name, phone });
  }
  return contacts;
}

/* ═══════════════════════════════════════════════════════════════════
 * CSV parser (Google Contacts, iCloud, Outlook)
 * ─ RFC 4180 (aspas, escape "", newline dentro de aspas)
 * ─ agnóstico ao idioma das colunas (heurística por nome)
 * ═══════════════════════════════════════════════════════════════════ */

function parseCSVRows(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, ''); // strip BOM

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cur.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      cur.push(field);
      field = '';
      if (cur.length > 1 || cur[0]) rows.push(cur);
      cur = [];
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }
  return rows;
}

export function parseCSV(text: string): SmartContact[] {
  const rows = parseCSVRows(text);
  if (rows.length < 2) return [];
  const header = rows[0]!.map((h) => h.trim().toLowerCase());

  const idxFull = header.findIndex(
    (h) => h === 'full name' || h === 'display name' || h === 'nome completo',
  );
  const idxName = header.indexOf('name');
  const idxGiven = header.findIndex((h) => h === 'given name' || h === 'first name' || h === 'nome');
  const idxFamily = header.findIndex(
    (h) => h === 'family name' || h === 'last name' || h === 'sobrenome',
  );

  const phoneCols: number[] = [];
  header.forEach((h, i) => {
    if (/phone.*value/i.test(h)) phoneCols.push(i);
    else if (/^(phone|mobile|cell|telephone|telefone|celular)$/i.test(h)) phoneCols.push(i);
  });

  const contacts: SmartContact[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]!;
    let name = '';
    if (idxFull > -1 && row[idxFull]) name = row[idxFull]!.trim();
    else if (idxName > -1 && row[idxName]) name = row[idxName]!.trim();
    if (!name) {
      const g = idxGiven > -1 ? row[idxGiven] ?? '' : '';
      const f = idxFamily > -1 ? row[idxFamily] ?? '' : '';
      name = `${g} ${f}`.trim();
    }
    if (!name) continue;

    let phone: string | null = null;
    for (const pi of phoneCols) {
      const cell = row[pi];
      if (!cell) continue;
      const first = cell.split(/\s*:::\s*/)[0]!;
      const cleaned = first.replace(/[^0-9+]/g, '');
      if (cleaned.length >= 8) {
        phone = cleaned;
        break;
      }
    }
    contacts.push({ name, phone });
  }
  return contacts;
}

/* ═══════════════════════════════════════════════════════════════════
 * Dedup (telefone normalizado; fallback por nome lowercase)
 * ═══════════════════════════════════════════════════════════════════ */

function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return '';
  const digits = raw.replace(/\D+/g, '');
  if (digits.length >= 12 && digits.startsWith('55')) return digits.slice(2);
  return digits;
}

function dedupContacts(
  incoming: SmartContact[],
  existing: ExistingContactLike[],
): { unique: SmartContact[]; duplicates: number } {
  const keys = new Set<string>();
  for (const e of existing) {
    const pk = normalizePhone(e.phone ?? null);
    keys.add(pk ? `p:${pk}` : `n:${(e.name || '').trim().toLowerCase()}`);
  }
  const seen = new Set<string>();
  const unique: SmartContact[] = [];
  let duplicates = 0;
  for (const c of incoming) {
    const pk = normalizePhone(c.phone);
    const key = pk ? `p:${pk}` : `n:${c.name.trim().toLowerCase()}`;
    if (!c.name.trim()) continue;
    if (keys.has(key) || seen.has(key)) {
      duplicates++;
      continue;
    }
    seen.add(key);
    unique.push(c);
  }
  return { unique, duplicates };
}

/* ═══════════════════════════════════════════════════════════════════
 * File reader util + file-type guard
 * ═══════════════════════════════════════════════════════════════════ */

function looksLikeVCF(text: string): boolean {
  return /BEGIN:VCARD/i.test(text.slice(0, 2000));
}

function looksLikeCSV(text: string, filename: string): boolean {
  if (/\.csv$/i.test(filename)) return true;
  const head = text.slice(0, 1000);
  return head.includes(',') && /\r?\n/.test(head) && !looksLikeVCF(text);
}

async function parseFile(file: File): Promise<SmartContact[]> {
  const text = await file.text();
  if (looksLikeVCF(text) || /\.(vcf|vcard)$/i.test(file.name)) return parseVCF(text);
  if (looksLikeCSV(text, file.name)) return parseCSV(text);
  return [];
}

/* ═══════════════════════════════════════════════════════════════════
 * Componente
 * ═══════════════════════════════════════════════════════════════════ */

const THEME = {
  obsidian: '#0e0e10',
  amethyst: '#c9a0ff',
};

export function SmartContactUploader({
  context,
  existingContacts,
  onImport,
  sourceLabel,
  className,
}: SmartContactUploaderProps) {
  const { mutateAsync: createLead } = useCreateLead();
  const { toast } = useToast();
  const [platform] = useState<Platform>(detectPlatform);
  const supportsNative = useMemo(() => platform === 'android' && hasContactPicker(), [platform]);

  const [busy, setBusy] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lastSummary, setLastSummary] = useState<{
    imported: number;
    duplicates: number;
    skipped: number;
  } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const source =
    sourceLabel ??
    (context === 'fir' ? 'FIR · Lista viva' : 'Jornada P5 · Lista viva');

  const persist = useCallback(
    async (contacts: SmartContact[]) => {
      if (contacts.length === 0) {
        toast('Nenhum contato novo pra importar', 'info');
        return { imported: 0, skipped: 0 };
      }
      setBusy(true);
      let imported = 0;
      let skipped = 0;
      for (const c of contacts) {
        try {
          await createLead({
            name: c.name,
            phone: c.phone ?? '',
            status: 'frio',
            source,
          });
          imported++;
        } catch {
          skipped++;
        }
      }
      setBusy(false);
      return { imported, skipped };
    },
    [createLead, source, toast],
  );

  const runImport = useCallback(
    async (rawContacts: SmartContact[]) => {
      const { unique, duplicates } = dedupContacts(rawContacts, existingContacts);
      const { imported, skipped } = await persist(unique);
      setLastSummary({ imported, duplicates, skipped });

      if (imported > 0) {
        const parts = [`${imported} contato${imported === 1 ? '' : 's'} importado${imported === 1 ? '' : 's'}`];
        if (duplicates > 0) parts.push(`${duplicates} duplicado${duplicates === 1 ? '' : 's'} ignorado${duplicates === 1 ? '' : 's'}`);
        toast(parts.join(' · '), 'success', 'contacts');
        onImport?.(unique.slice(0, imported));
      } else if (duplicates > 0) {
        toast(`Todos os ${duplicates} contatos já estavam na sua lista`, 'info');
      } else if (skipped > 0) {
        toast('Não foi possível importar os contatos selecionados', 'error');
      }
    },
    [existingContacts, onImport, persist, toast],
  );

  /* ─── Handlers ─── */

  const handleNativePick = useCallback(async () => {
    const picked = await pickNativeContacts();
    if (picked.length === 0) {
      toast('Nenhum contato selecionado', 'info');
      return;
    }
    await runImport(picked);
  }, [runImport, toast]);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      try {
        const parsed = await parseFile(file);
        if (parsed.length === 0) {
          toast('Arquivo sem contatos reconhecíveis. Envie um .vcf ou .csv do Google Contacts.', 'error');
          return;
        }
        await runImport(parsed);
      } catch {
        toast('Não consegui ler esse arquivo. Tente exportar novamente como .vcf ou .csv.', 'error');
      }
    },
    [runImport, toast],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      void handleFile(file);
    },
    [handleFile],
  );

  const openFilePicker = () => fileRef.current?.click();

  /* ─── Render ─── */

  const title =
    context === 'fir'
      ? 'Importação inteligente'
      : 'Lista Viva turbo';
  const subtitle =
    context === 'fir'
      ? 'Do seu celular pra sua lista em 2 toques.'
      : 'Acelere sua prospecção: importe contatos direto do celular.';

  return (
    <div
      className={cn('rounded-card border border-am-dim/25 p-5 shadow-glow-am', className)}
      style={{ background: THEME.obsidian, color: THEME.amethyst }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'rgba(201,160,255,.12)' }}
        >
          <Icon name="auto_awesome" filled className="!text-[22px] text-am-dim" />
        </div>
        <div className="flex-1">
          <h3
            className="font-display italic"
            style={{ color: THEME.amethyst, fontSize: '1.15rem', fontWeight: 700 }}
          >
            {title}
          </h3>
          <p className="mt-0.5 text-[12px] text-am-dim/70">{subtitle}</p>
        </div>
        <span className="rounded-chip border border-am-dim/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.18em] text-am-dim">
          {platform === 'android' ? 'Android' : platform === 'ios' ? 'iPhone' : 'Desktop'}
        </span>
      </div>

      {/* CTA principal por plataforma */}
      <div className="mt-5 flex flex-col gap-2.5">
        {supportsNative && (
          <Button
            variant="gp"
            size="md"
            fullWidth
            disabled={busy}
            onClick={handleNativePick}
            leftIcon={<Icon name="smartphone" className="!text-[18px]" />}
          >
            {busy ? 'Importando…' : 'Selecionar contatos do Android'}
          </Button>
        )}

        {platform === 'ios' && (
          <Button
            variant="gp"
            size="md"
            fullWidth
            disabled={busy}
            onClick={() => setShowWizard((v) => !v)}
            leftIcon={<Icon name="auto_stories" className="!text-[18px]" />}
          >
            {showWizard ? 'Fechar guia iPhone' : 'Abrir guia iPhone (4 passos)'}
          </Button>
        )}

        {/* Android sem Contact Picker (Samsung Internet, Firefox Mobile, etc) */}
        {platform === 'android' && !supportsNative && (
          <>
            <a
              href={buildOpenInChromeIntent()}
              className="tap"
              aria-label="Abrir esta página no Google Chrome"
            >
              <Button
                variant="gp"
                size="md"
                fullWidth
                disabled={busy}
                leftIcon={<Icon name="open_in_new" className="!text-[18px]" />}
              >
                Abrir no Chrome pra importar contatos
              </Button>
            </a>
            <p className="text-[10px] text-am-dim/70 leading-relaxed">
              Seu navegador atual não permite seleção direta de contatos.
              No Chrome, vai aparecer o seletor nativo do Android — igual ao Xiaomi.
            </p>
          </>
        )}

        {platform === 'desktop' && (
          <DesktopDropzone
            onPick={openFilePicker}
            onDrop={handleDrop}
            dragOver={dragOver}
            setDragOver={setDragOver}
            busy={busy}
          />
        )}

        <Button
          variant="outline"
          size="sm"
          fullWidth
          disabled={busy}
          onClick={openFilePicker}
          leftIcon={<Icon name="upload_file" className="!text-[16px]" />}
          className="!border-am-dim/40 !text-am-dim hover:!border-am-dim"
        >
          {platform === 'desktop' ? 'Ou selecionar arquivo .vcf / .csv' : 'Importar arquivo .vcf / .csv'}
        </Button>
      </div>

      {/* Wizard iPhone (Android sem picker agora vai pro Chrome direto) */}
      {showWizard && platform === 'ios' && <ContactExportWizard kind="ios" />}

      {/* Summary do último import */}
      {lastSummary && (
        <div
          className="mt-4 rounded-card-sm border px-3 py-2.5 text-[11px]"
          style={{ borderColor: 'rgba(201,160,255,.25)', background: 'rgba(201,160,255,.06)' }}
        >
          <div className="flex items-center gap-2 font-semibold text-am-dim">
            <Icon name="fact_check" filled className="!text-[14px]" />
            Resumo do último import
          </div>
          <ul className="mt-1.5 space-y-0.5 text-am-dim/80">
            <li>✓ {lastSummary.imported} novo(s) adicionado(s) à lista</li>
            {lastSummary.duplicates > 0 && (
              <li>⊘ {lastSummary.duplicates} duplicado(s) ignorado(s)</li>
            )}
            {lastSummary.skipped > 0 && (
              <li>⚠ {lastSummary.skipped} sem telefone válido — ignorado(s)</li>
            )}
          </ul>
        </div>
      )}

      <p className="mt-4 text-[10px] text-am-dim/50">
        Contatos ficam só na sua conta. Ninguém mais vê.
      </p>

      {/* input file oculto; sem `accept` pra não forçar galeria em iOS/Android */}
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0] ?? undefined);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 * Dropzone desktop
 * ═══════════════════════════════════════════════════════════════════ */

function DesktopDropzone({
  onPick,
  onDrop,
  dragOver,
  setDragOver,
  busy,
}: {
  onPick: () => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  busy: boolean;
}) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={onPick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onPick();
      }}
      className={cn(
        'tap flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-4 py-7 text-center transition',
        dragOver ? 'border-am-dim bg-am-dim/10' : 'border-am-dim/30 hover:border-am-dim/60',
        busy && 'pointer-events-none opacity-60',
      )}
    >
      <Icon name="cloud_upload" filled className="!text-[30px] text-am-dim" />
      <div className="font-display italic text-[15px] text-am-dim">
        {dragOver ? 'Solta aqui' : 'Arraste um .vcf ou .csv'}
      </div>
      <div className="text-[11px] text-am-dim/60">ou clique para escolher do seu computador</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 * Wizard de exportação de contatos (iPhone / Android sem picker)
 * ═══════════════════════════════════════════════════════════════════ */

function ContactExportWizard({ kind }: { kind: 'ios' | 'android' }) {
  const stepsByKind: Record<'ios' | 'android', Array<{ icon: string; title: string; detail: string }>> = {
    ios: [
      {
        icon: 'contacts',
        title: 'Abra o app Contatos',
        detail: 'Aquele ícone cinza padrão do iPhone.',
      },
      {
        icon: 'list_alt',
        title: 'Toque em "Listas"',
        detail: 'Escolha a lista com os contatos que você quer importar (ou "Todos os Contatos").',
      },
      {
        icon: 'ios_share',
        title: 'Exportar → Salvar em Arquivos',
        detail: 'O iPhone gera um único arquivo .vcf com todos os contatos da lista.',
      },
      {
        icon: 'upload_file',
        title: 'Volte aqui e toque em "Importar arquivo"',
        detail: 'Navegue até "Arquivos" ou "Downloads" e selecione o .vcf recém-salvo.',
      },
    ],
    android: [
      {
        icon: 'contacts',
        title: 'Abra o app Contatos do celular',
        detail: 'No Samsung é o ícone "Contatos" verde. Em outros Androids vem como "Telefone" ou "Pessoas".',
      },
      {
        icon: 'menu',
        title: 'Menu (≡) → "Gerenciar contatos" ou "Configurações"',
        detail: 'No Samsung: três traços no canto → "Gerenciar contatos". Em outros: ícone de engrenagem.',
      },
      {
        icon: 'ios_share',
        title: 'Toque em "Importar/Exportar" → "Exportar para arquivo .vcf"',
        detail: 'Selecione TODOS os contatos. O celular salva um arquivo .vcf no Downloads.',
      },
      {
        icon: 'upload_file',
        title: 'Volte aqui e toque em "Importar arquivo .vcf"',
        detail: 'Procure no Downloads pelo arquivo .vcf que você acabou de exportar.',
      },
    ],
  };

  const title = kind === 'ios' ? 'Passo a passo no iPhone' : 'Passo a passo no Android (Samsung e outros)';
  const steps = stepsByKind[kind];

  return (
    <div
      className="mt-4 rounded-card border p-4"
      style={{ borderColor: 'rgba(201,160,255,.22)', background: 'rgba(201,160,255,.04)' }}
    >
      <div className="mb-3 font-display italic text-[13px] text-am-dim">{title}</div>
      <ol className="flex flex-col gap-3">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold"
              style={{ borderColor: 'rgba(201,160,255,.4)', color: '#c9a0ff' }}
            >
              {i + 1}
            </div>
            <div className="flex-1 pt-0.5">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-am-dim">
                <Icon name={s.icon} filled className="!text-[15px]" />
                {s.title}
              </div>
              <div className="mt-0.5 text-[11px] leading-relaxed text-am-dim/70">{s.detail}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
