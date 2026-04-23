import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@shared/ui/Modal';
import { Icon } from '@shared/ui/Icon';
import type { ImportOptions, ImportReport, FilterReason } from '@lib/contacts-import';
import { processContacts, type ParsedVCardRich } from '@lib/contacts-import';
import { useBulkCreateLeads, useExistingPhones } from '../hooks/useLeads';

interface ImportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  cards: ParsedVCardRich[];
  source: string;
  onComplete?: (insertedCount: number) => void;
}

type Step = 'analyzing' | 'review' | 'success';

const ANALYZING_MESSAGES = [
  'Lendo o arquivo…',
  'Identificando números brasileiros…',
  'Separando celulares de fixos…',
  'Detectando serviços e SACs…',
  'Procurando duplicados…',
  'Validando DDDs da ANATEL…',
  'Polindo a lista final…',
];

const FILTER_META: Record<
  FilterReason,
  { label: string; icon: string; chipClass: string; iconClass: string }
> = {
  all_landline: {
    label: 'Telefones fixos',
    icon: 'call_end',
    chipClass: 'bg-gd/10 border-gd/25',
    iconClass: 'text-gd',
  },
  no_phone: {
    label: 'Sem número salvo',
    icon: 'phone_disabled',
    chipClass: 'bg-sf-hi border-sf-top',
    iconClass: 'text-on-3',
  },
  duplicate_in_database: {
    label: 'Já estão na sua lista',
    icon: 'sync',
    chipClass: 'bg-sp/10 border-sp/25',
    iconClass: 'text-sp',
  },
  duplicate_in_import: {
    label: 'Repetidos no arquivo',
    icon: 'content_copy',
    chipClass: 'bg-sp/10 border-sp/25',
    iconClass: 'text-sp',
  },
  all_invalid: {
    label: 'Números incompletos',
    icon: 'error_outline',
    chipClass: 'bg-rb/10 border-rb/25',
    iconClass: 'text-rb',
  },
  all_service: {
    label: 'Serviços (0800, 4004…)',
    icon: 'support_agent',
    chipClass: 'bg-or/10 border-or/25',
    iconClass: 'text-or',
  },
  looks_like_business: {
    label: 'Parecem empresas',
    icon: 'business',
    chipClass: 'bg-gd/10 border-gd/25',
    iconClass: 'text-gd',
  },
  international: {
    label: 'Internacionais',
    icon: 'public',
    chipClass: 'bg-cy/10 border-cy/25',
    iconClass: 'text-cy',
  },
  no_name: {
    label: 'Sem nome salvo',
    icon: 'person_off',
    chipClass: 'bg-sf-hi border-sf-top',
    iconClass: 'text-on-3',
  },
};

// ============================================================

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = value;
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

// ============================================================

export function ImportPreviewModal({
  open,
  onClose,
  cards,
  source,
  onComplete,
}: ImportPreviewModalProps) {
  const [step, setStep] = useState<Step>('analyzing');
  const [options, setOptions] = useState<ImportOptions>({
    includeNoName: true,
    includeInternational: false,
    includeBusinessLike: false,
  });
  const [expanded, setExpanded] = useState<FilterReason | null>(null);

  const { data: existingPhones } = useExistingPhones();
  const { mutateAsync: bulkCreate, isPending } = useBulkCreateLeads();

  const report: ImportReport = useMemo(
    () =>
      processContacts(cards, {
        ...options,
        ...(existingPhones ? { existingPhones } : {}),
      }),
    [cards, options, existingPhones],
  );

  // Reset ao abrir/fechar
  useEffect(() => {
    if (open) {
      setStep('analyzing');
      setExpanded(null);
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} maxWidth="540px">
      <div className="-m-5 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnalyzingStep
                totalContacts={cards.length}
                onDone={() => setStep('review')}
              />
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <ReviewStep
                report={report}
                options={options}
                setOptions={setOptions}
                totalContacts={cards.length}
                expanded={expanded}
                setExpanded={setExpanded}
                onCancel={onClose}
                isImporting={isPending}
                onConfirm={async () => {
                  const result = await bulkCreate({
                    contacts: report.valid,
                    source,
                  });
                  setStep('success');
                  onComplete?.(result.inserted);
                }}
              />
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SuccessStep count={report.valid.length} onClose={onClose} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}

// ============================================================
// ETAPA 1 — ANALYZING
// ============================================================

function AnalyzingStep({
  totalContacts,
  onDone,
}: {
  totalContacts: number;
  onDone: () => void;
}) {
  const [pct, setPct] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = Math.min(2200, Math.max(1200, totalContacts * 4));
    let raf = 0;
    const tick = (t: number) => {
      const e = t - start;
      const p = Math.min(e / duration, 1);
      const eased = 1 - Math.pow(1 - p, 2.5);
      setPct(Math.round(eased * 100));
      setMsgIdx(
        Math.min(Math.floor(p * ANALYZING_MESSAGES.length), ANALYZING_MESSAGES.length - 1),
      );
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 240);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [totalContacts, onDone]);

  const count = useCountUp(Math.round((pct / 100) * totalContacts), 280);

  return (
    <div className="flex flex-col items-center justify-center px-8 py-14">
      <div className="relative mb-7 h-24 w-24">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from -90deg, #edb1ff ${pct * 3.6}deg, #2a2a2c 0deg)`,
          }}
        />
        <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-sf-c">
          <Icon name="contacts" filled className="!text-[28px] text-am animate-pulse-soft" />
        </div>
      </div>

      <p className="serif mb-1 text-5xl font-bold tabular-nums text-on">
        {count}
        <span className="text-on-3">/{totalContacts}</span>
      </p>
      <p className="mb-8 text-[10px] uppercase tracking-[0.3em] text-on-3">
        contatos analisados
      </p>

      <div className="relative h-5 w-full max-w-sm overflow-hidden">
        {ANALYZING_MESSAGES.map((m, i) => (
          <p
            key={i}
            className="absolute inset-0 text-center text-sm text-on-2 transition-all duration-500"
            style={{
              transform: `translateY(${(i - msgIdx) * 20}px)`,
              opacity: i === msgIdx ? 1 : 0,
            }}
          >
            {m}
          </p>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// ETAPA 2 — REVIEW
// ============================================================

function ReviewStep({
  report,
  options,
  setOptions,
  totalContacts,
  expanded,
  setExpanded,
  onCancel,
  onConfirm,
  isImporting,
}: {
  report: ImportReport;
  options: ImportOptions;
  setOptions: (o: ImportOptions) => void;
  totalContacts: number;
  expanded: FilterReason | null;
  setExpanded: (r: FilterReason | null) => void;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  isImporting: boolean;
}) {
  const validCount = useCountUp(report.valid.length, 900);
  const filteredTotal = report.filtered.length;
  const fixed = report.stats.fixed;

  const filteredByReason = useMemo(() => {
    const grouped = new Map<FilterReason, typeof report.filtered>();
    for (const item of report.filtered) {
      const arr = grouped.get(item.reason) ?? [];
      arr.push(item);
      grouped.set(item.reason, arr);
    }
    return Array.from(grouped.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [report.filtered]);

  return (
    <div className="flex max-h-[85vh] flex-col">
      {/* HERO */}
      <div className="px-6 pb-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.3em] text-on-3">
            Revisão · Etapa 2 de 3
          </p>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-em">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-em" />
            Curadoria ativa
          </div>
        </div>

        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="serif text-5xl font-bold leading-none text-on">
            <span className="bg-gp bg-clip-text tabular-nums text-transparent">{validCount}</span>
          </h2>
          <p className="text-sm text-on-2">
            de <span className="tabular-nums text-on">{totalContacts}</span> prontos pra virar leads
          </p>
        </div>

        {fixed > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-chip border border-am/30 bg-am/10 px-3 py-1.5 text-xs text-am">
            <Icon name="auto_awesome" filled className="!text-[14px]" />
            {fixed} número{fixed > 1 ? 's' : ''} antigo{fixed > 1 ? 's' : ''} corrigido
            {fixed > 1 ? 's' : ''} automaticamente
          </div>
        )}
      </div>

      {/* FILTRADOS */}
      <div className="flex-1 overflow-y-auto border-t border-sf-hi/60 px-6 py-5">
        {filteredTotal > 0 && (
          <>
            <p className="mb-3 text-xs font-semibold text-on-2">
              <span className="text-on">{filteredTotal}</span>{' '}
              {filteredTotal === 1 ? 'contato filtrado' : 'contatos filtrados'} pela curadoria
            </p>

            <div className="flex flex-col gap-1.5">
              {filteredByReason.map(([reason, arr], i) => {
                const meta = FILTER_META[reason];
                const isOpen = expanded === reason;
                return (
                  <div
                    key={reason}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <button
                      onClick={() => setExpanded(isOpen ? null : reason)}
                      className={`tap flex w-full items-center gap-3 rounded-card-sm border px-3 py-2.5 text-left ${meta.chipClass}`}
                    >
                      <Icon name={meta.icon} filled className={`!text-[18px] ${meta.iconClass}`} />
                      <span className="flex-1 text-sm text-on">{meta.label}</span>
                      <span className={`font-semibold tabular-nums ${meta.iconClass}`}>
                        {arr.length}
                      </span>
                      <Icon
                        name="chevron_right"
                        className={`!text-[16px] text-on-3 transition-transform ${
                          isOpen ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1 py-2 pl-10 pr-2">
                            {arr.slice(0, 30).map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 text-xs text-on-3"
                              >
                                <span className="h-1 w-1 rounded-full bg-sf-top" />
                                <span className="truncate text-on-2">
                                  {item.original.name || 'Sem nome'}
                                </span>
                                {item.original.phones[0] && (
                                  <span className="truncate font-mono text-on-3">
                                    · {item.original.phones[0].value}
                                  </span>
                                )}
                              </div>
                            ))}
                            {arr.length > 30 && (
                              <div className="pl-3 pt-1 text-xs italic text-on-3">
                                + {arr.length - 30} outro{arr.length - 30 > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* TOGGLES */}
        <div className="mt-7 border-t border-sf-hi/60 pt-5">
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-on-3">
            Recuperar categorias opcionais
          </p>
          <div className="flex flex-col gap-1">
            <Toggle
              checked={options.includeNoName ?? true}
              onChange={(v) => setOptions({ ...options, includeNoName: v })}
              label="Contatos sem nome salvo"
              hint='Aparecem como "Sem nome" — bom pra números soltos'
            />
            <Toggle
              checked={options.includeInternational ?? false}
              onChange={(v) => setOptions({ ...options, includeInternational: v })}
              label="Contatos internacionais"
              hint="Números de fora do Brasil"
            />
            <Toggle
              checked={options.includeBusinessLike ?? false}
              onChange={(v) => setOptions({ ...options, includeBusinessLike: v })}
              label="Que parecem empresas"
              hint="Cuidado: alguns podem ser parceiros legítimos"
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between gap-3 border-t border-sf-hi/60 bg-sf-void/60 px-6 py-4">
        <button
          onClick={onCancel}
          disabled={isImporting}
          className="tap px-3 py-2 text-sm text-on-3 hover:text-on"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={report.valid.length === 0 || isImporting}
          className="tap flex items-center gap-2 rounded-chip bg-gp px-5 py-2.5 text-sm font-semibold text-sf-void shadow-glow-am disabled:opacity-40 disabled:grayscale"
        >
          {isImporting ? (
            <>
              <Icon name="progress_activity" className="!text-[18px] animate-spin" />
              Importando…
            </>
          ) : (
            <>
              Importar {report.valid.length} lead{report.valid.length !== 1 ? 's' : ''}
              <Icon name="arrow_forward" className="!text-[16px]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="tap flex items-start gap-3 rounded-card-sm p-2.5 text-left hover:bg-sf-hi/40"
    >
      <span
        className={`relative mt-0.5 h-5 w-9 flex-shrink-0 rounded-full transition-all ${
          checked ? 'bg-gp' : 'bg-sf-hi border border-sf-top'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-soft transition-all ${
            checked ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm text-on">{label}</span>
        {hint && <span className="mt-0.5 block text-xs leading-snug text-on-3">{hint}</span>}
      </span>
    </button>
  );
}

// ============================================================
// ETAPA 3 — SUCCESS
// ============================================================

function SuccessStep({ count, onClose }: { count: number; onClose: () => void }) {
  const animated = useCountUp(count, 1300);
  const xp = count * 15;

  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);

  // Confete determinístico
  const confetti = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 1.8 + Math.random() * 1.2,
        size: 4 + Math.random() * 7,
        color: ['#edb1ff', '#ffd700', '#50c878', '#c9a0ff'][i % 4],
        rot: 360 + Math.random() * 720,
        x: (Math.random() - 0.5) * 200,
      })),
    [],
  );

  return (
    <div className="relative flex flex-col items-center justify-center px-8 py-14 overflow-hidden">
      {confetti.map((c, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-sm"
          style={
            {
              left: `${c.left}%`,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              animation: `confetti-fall ${c.duration}s ease-out ${c.delay}s forwards`,
              '--confetti-x': `${c.x}px`,
              '--confetti-rot': `${c.rot}deg`,
            } as CSSProperties
          }
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 220 }}
        className="relative mb-5"
      >
        <div className="absolute inset-0 scale-150 rounded-full bg-em/40 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-ge shadow-glow-am">
          <Icon name="check" filled className="!text-[44px] text-sf-void" />
        </div>
      </motion.div>

      <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-em">Importação concluída</p>
      <p className="serif mb-2 text-6xl font-bold leading-none tabular-nums text-on">
        {animated}
      </p>
      <p className="mb-4 text-sm text-on-2">
        lead{count !== 1 ? 's' : ''} {count !== 1 ? 'adicionados' : 'adicionado'} à sua rede
      </p>
      <div className="flex items-center gap-1.5 rounded-chip bg-gd/15 px-3 py-1.5 text-xs font-bold text-gd">
        <Icon name="bolt" filled className="!text-[14px]" />+{xp} XP
      </div>
    </div>
  );
}
