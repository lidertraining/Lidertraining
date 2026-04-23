import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { useToast } from '@shared/hooks/useToast';
import { cn } from '@lib/cn';
import { parseVCFRich, type ParsedVCardRich } from '@lib/contacts-import';
import { ImportPreviewModal } from '@features/prospector/components/ImportPreviewModal';

/* ═══════════════════════════════════════════════════════════════════
 * Tipos públicos (preservados pra compat)
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
 * Gera URL de Android Intent que força o Chrome a abrir a página atual.
 * Funciona em Samsung Internet, Firefox Mobile e qualquer outro navegador
 * Android. Se Chrome não estiver instalado, fallback transparente.
 */
function buildOpenInChromeIntent(): string {
  const url = window.location.href;
  const stripped = url.replace(/^https?:\/\//, '');
  return `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;end`;
}

/* ═══════════════════════════════════════════════════════════════════
 * Contact Picker API (Android Chrome) — agora retorna ParsedVCardRich
 * ═══════════════════════════════════════════════════════════════════ */

async function pickNativeContactsRich(): Promise<ParsedVCardRich[]> {
  if (!hasContactPicker()) return [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    const results: Array<{ name?: string[]; tel?: string[]; email?: string[] }> =
      await nav.contacts.select(['name', 'tel', 'email'], { multiple: true });
    return results.map((c) => ({
      name: (c.name?.[0] ?? '').trim(),
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

/* ═══════════════════════════════════════════════════════════════════
 * CSV parser (Google Contacts, iCloud, Outlook) — único do uploader
 * ─ RFC 4180 (aspas, escape "", newline dentro de aspas)
 * ─ converte direto pra ParsedVCardRich
 * ═══════════════════════════════════════════════════════════════════ */

function parseCSVRows(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, '');

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

function parseCSVRich(text: string): ParsedVCardRich[] {
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
  const idxEmail = header.findIndex((h) => /e?mail/i.test(h));
  const idxOrg = header.findIndex((h) => /^(organization|organização|company|empresa)$/i.test(h));

  const phoneCols: number[] = [];
  header.forEach((h, i) => {
    if (/phone.*value/i.test(h)) phoneCols.push(i);
    else if (/^(phone|mobile|cell|telephone|telefone|celular)$/i.test(h)) phoneCols.push(i);
  });

  const cards: ParsedVCardRich[] = [];
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

    const phones: Array<{ value: string; types: string[] }> = [];
    for (const pi of phoneCols) {
      const cell = row[pi];
      if (!cell) continue;
      const first = cell.split(/\s*:::\s*/)[0]!;
      const v = first.trim();
      if (v) phones.push({ value: v, types: ['CELL'] });
    }

    const emails: Array<{ value: string; types: string[] }> = [];
    if (idxEmail > -1 && row[idxEmail]) {
      const v = row[idxEmail]!.trim();
      if (v) emails.push({ value: v, types: [] });
    }

    const organization =
      idxOrg > -1 && row[idxOrg] && row[idxOrg]!.trim() ? row[idxOrg]!.trim() : undefined;

    cards.push({
      name,
      phones,
      emails,
      addresses: [],
      urls: [],
      categories: [],
      impps: [],
      socialProfiles: [],
      relatedNames: [],
      customDates: [],
      raw: '',
      ...(organization ? { organization } : {}),
    });
  }
  return cards;
}

/* ═══════════════════════════════════════════════════════════════════
 * File reader util + file-type guard
 * ═══════════════════════════════════════════════════════════════════ */

function looksLikeVCF(text: string): boolean {
  return /BEGIN:VCARD/i.test(text);
}

function looksLikeCSV(text: string, filename: string): boolean {
  if (/\.csv$/i.test(filename)) return true;
  const head = text.slice(0, 1000);
  return head.includes(',') && /\r?\n/.test(head) && !looksLikeVCF(text);
}

/**
 * Lê o arquivo com fallback de encoding. iPhone Safari e iCloud às vezes
 * exportam VCF como UTF-16LE com BOM — o default do File.text() (UTF-8) não
 * reconhece e devolve texto vazio/lixo. Aqui tentamos UTF-8 primeiro e
 * caímos pra UTF-16 se não achar BEGIN:VCARD.
 */
async function readContactFile(file: File): Promise<string> {
  const utf8 = (await file.text()).replace(/^\uFEFF/, '');
  if (/BEGIN:VCARD/i.test(utf8)) return utf8;
  try {
    const buf = await file.arrayBuffer();
    const utf16 = new TextDecoder('utf-16le').decode(buf).replace(/^\uFEFF/, '');
    if (/BEGIN:VCARD/i.test(utf16)) return utf16;
  } catch {
    /* noop */
  }
  return utf8;
}

async function parseFileRich(file: File): Promise<ParsedVCardRich[]> {
  const text = await readContactFile(file);
  if (looksLikeVCF(text) || /\.(vcf|vcard)$/i.test(file.name)) return parseVCFRich(text);
  if (looksLikeCSV(text, file.name)) return parseCSVRich(text);
  // Fallback: se não bateu nem VCF nem CSV, tenta parseVCFRich mesmo assim
  // (iPhone Safari às vezes manda o arquivo sem extensão reconhecível).
  return parseVCFRich(text);
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
  onImport,
  sourceLabel,
  className,
}: SmartContactUploaderProps) {
  const { toast } = useToast();
  const [platform] = useState<Platform>(detectPlatform);
  const supportsNative = useMemo(() => platform === 'android' && hasContactPicker(), [platform]);

  const [busy, setBusy] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingCards, setPendingCards] = useState<ParsedVCardRich[]>([]);
  const [lastInserted, setLastInserted] = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const source =
    sourceLabel ?? (context === 'fir' ? 'FIR · Lista viva' : 'Jornada P5 · Lista viva');

  const openPreview = useCallback(
    (cards: ParsedVCardRich[]) => {
      if (cards.length === 0) {
        toast('Nenhum contato encontrado', 'info');
        return;
      }
      setPendingCards(cards);
      setPreviewOpen(true);
    },
    [toast],
  );

  /* ─── Handlers ─── */

  const handleNativePick = useCallback(async () => {
    setBusy(true);
    const cards = await pickNativeContactsRich();
    setBusy(false);
    openPreview(cards);
  }, [openPreview]);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setBusy(true);
      try {
        const cards = await parseFileRich(file);
        setBusy(false);
        if (cards.length === 0) {
          toast(
            'Arquivo sem contatos reconhecíveis. Envie um .vcf ou .csv do Google Contacts.',
            'error',
          );
          return;
        }
        openPreview(cards);
      } catch {
        setBusy(false);
        toast('Não consegui ler esse arquivo. Tente exportar novamente como .vcf ou .csv.', 'error');
      }
    },
    [openPreview, toast],
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

  const title = context === 'fir' ? 'Importação inteligente' : 'Lista Viva turbo';
  const subtitle =
    context === 'fir'
      ? 'Do seu celular pra sua lista em 2 toques.'
      : 'Acelere sua prospecção: importe contatos direto do celular.';

  return (
    <>
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
              {busy ? 'Lendo contatos…' : 'Selecionar contatos do Android'}
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
                Seu navegador atual não permite seleção direta de contatos. No Chrome,
                vai aparecer o seletor nativo do Android — igual ao Xiaomi.
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

        {/* Resumo do último import */}
        {lastInserted !== null && lastInserted > 0 && (
          <div
            className="mt-4 rounded-card-sm border px-3 py-2.5 text-[11px]"
            style={{ borderColor: 'rgba(201,160,255,.25)', background: 'rgba(201,160,255,.06)' }}
          >
            <div className="flex items-center gap-2 font-semibold text-am-dim">
              <Icon name="fact_check" filled className="!text-[14px]" />
              {lastInserted} contato{lastInserted !== 1 ? 's' : ''} adicionado
              {lastInserted !== 1 ? 's' : ''} à sua lista
            </div>
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

      <ImportPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        cards={pendingCards}
        source={source}
        onComplete={(count) => {
          setPreviewOpen(false);
          setLastInserted(count);
          // Notifica o parent (FIRStepContatos / PassoOperacional) pra re-fetchar leads se precisar
          onImport?.([]);
        }}
      />
    </>
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
 * Wizard de exportação de contatos (iPhone)
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
