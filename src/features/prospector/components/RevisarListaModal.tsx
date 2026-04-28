import { useMemo, useState } from 'react';
import type { Lead, LeadCategory } from '@ltypes/domain';
import { Modal } from '@shared/ui/Modal';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Icon } from '@shared/ui/Icon';
import { useArchiveLeads } from '../hooks/useLeads';

interface RevisarListaModalProps {
  open: boolean;
  onClose: () => void;
  leads: Lead[];
}

const CATEGORY_META: Record<
  LeadCategory,
  { label: string; emoji: string; description: string; suggestion: string }
> = {
  familia: {
    label: 'Família',
    emoji: '❤️',
    description: 'Pessoas próximas com vínculo afetivo',
    suggestion: 'Mantenha — são contatos quentes pra sua jornada',
  },
  amigo_proximo: {
    label: 'Amigos próximos',
    emoji: '🤝',
    description: 'Apelidos íntimos e primeiros nomes',
    suggestion: 'Excelentes pra iniciar conversas espontâneas',
  },
  conhecido: {
    label: 'Conhecidos',
    emoji: '👋',
    description: 'Nome completo formal ou vínculo contextual',
    suggestion: 'Rever caso a caso — alguns valem prospecção',
  },
  profissional: {
    label: 'Profissionais',
    emoji: '💼',
    description: 'Têm cargo, empresa ou título no nome',
    suggestion: 'Avalie se faz sentido pra seu negócio',
  },
  desconhecido: {
    label: 'A descobrir',
    emoji: '👤',
    description: 'Sinais insuficientes pra classificar',
    suggestion: 'Provavelmente vale uma checagem manual',
  },
};

type Screen = 'overview' | 'category';

export function RevisarListaModal({ open, onClose, leads }: RevisarListaModalProps) {
  const [screen, setScreen] = useState<Screen>('overview');
  const [activeCategory, setActiveCategory] = useState<LeadCategory | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const { mutateAsync: archive, isPending: archiving } = useArchiveLeads();

  const byCategory = useMemo(() => {
    const groups: Record<LeadCategory, Lead[]> = {
      familia: [],
      amigo_proximo: [],
      conhecido: [],
      profissional: [],
      desconhecido: [],
    };
    for (const lead of leads) {
      const cat = lead.category ?? 'desconhecido';
      groups[cat].push(lead);
    }
    return groups;
  }, [leads]);

  const totalClassified = leads.filter((l) => l.category && l.category !== 'desconhecido').length;

  const activeLeads = useMemo(() => {
    if (!activeCategory) return [];
    const list = byCategory[activeCategory];
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.phone ?? '').toLowerCase().includes(q) ||
        (l.organization ?? '').toLowerCase().includes(q),
    );
  }, [activeCategory, byCategory, search]);

  const handleClose = () => {
    setScreen('overview');
    setActiveCategory(null);
    setSelectedIds(new Set());
    setSearch('');
    onClose();
  };

  const openCategory = (cat: LeadCategory) => {
    setActiveCategory(cat);
    setSelectedIds(new Set());
    setSearch('');
    setScreen('category');
  };

  const toggleLead = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelectedIds(new Set(activeLeads.map((l) => l.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const archiveSelected = async () => {
    if (selectedIds.size === 0) return;
    await archive(Array.from(selectedIds));
    setSelectedIds(new Set());
    setScreen('overview');
    setActiveCategory(null);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={screen === 'overview' ? 'Revisar lista' : CATEGORY_META[activeCategory!]?.label ?? ''}
      maxWidth="420px"
    >
      {screen === 'overview' ? (
        <OverviewScreen
          byCategory={byCategory}
          totalLeads={leads.length}
          totalClassified={totalClassified}
          onCategoryClick={openCategory}
          onClose={handleClose}
        />
      ) : (
        <CategoryScreen
          category={activeCategory!}
          leads={activeLeads}
          totalInCategory={byCategory[activeCategory!].length}
          search={search}
          onSearchChange={setSearch}
          selectedIds={selectedIds}
          onToggleLead={toggleLead}
          onSelectAll={selectAllVisible}
          onClearSelection={clearSelection}
          onBack={() => setScreen('overview')}
          onArchive={archiveSelected}
          archiving={archiving}
        />
      )}
    </Modal>
  );
}

// ────────────────────────────────────────────────
// OVERVIEW
// ────────────────────────────────────────────────

interface OverviewScreenProps {
  byCategory: Record<LeadCategory, Lead[]>;
  totalLeads: number;
  totalClassified: number;
  onCategoryClick: (cat: LeadCategory) => void;
  onClose: () => void;
}

function OverviewScreen({
  byCategory,
  totalLeads,
  totalClassified,
  onCategoryClick,
  onClose,
}: OverviewScreenProps) {
  const order: LeadCategory[] = [
    'familia',
    'amigo_proximo',
    'conhecido',
    'profissional',
    'desconhecido',
  ];

  if (totalLeads === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <Icon name="contacts" className="!text-[40px] text-on-3" />
        <div className="text-sm font-semibold text-on-2">Nenhum lead pra revisar</div>
        <div className="text-xs text-on-3">Importe seus contatos primeiro.</div>
        <Button variant="surface" onClick={onClose} className="mt-2">
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-card-sm bg-am/10 px-3 py-2 text-[11px] leading-relaxed text-on-2">
        <div className="mb-1 flex items-center gap-1 font-semibold text-am">
          <Icon name="auto_awesome" filled className="!text-[14px]" />
          Classifiquei seus {totalLeads} leads
        </div>
        <div>
          {totalClassified > 0
            ? `Detectei padrões em ${totalClassified} contatos. Toque numa categoria pra revisar e organizar.`
            : 'Toque numa categoria pra explorar seus leads.'}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {order.map((cat) => {
          const list = byCategory[cat];
          if (list.length === 0) return null;
          const meta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              onClick={() => onCategoryClick(cat)}
              className="tap surface flex items-center gap-3 px-3 py-3 text-left hover-glow"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sf-c text-[20px]">
                {meta.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-semibold text-on">{meta.label}</div>
                  <div className="rounded-full bg-am/15 px-2 py-0.5 text-[10px] font-semibold text-am">
                    {list.length}
                  </div>
                </div>
                <div className="mt-0.5 truncate text-[11px] text-on-3">{meta.suggestion}</div>
              </div>
              <Icon name="chevron_right" className="!text-[18px] shrink-0 text-on-3" />
            </button>
          );
        })}
      </div>

      <div className="mt-1 text-center text-[10px] text-on-3">
        Arquivar não apaga — você pode restaurar depois.
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// CATEGORY
// ────────────────────────────────────────────────

interface CategoryScreenProps {
  category: LeadCategory;
  leads: Lead[];
  totalInCategory: number;
  search: string;
  onSearchChange: (s: string) => void;
  selectedIds: Set<string>;
  onToggleLead: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBack: () => void;
  onArchive: () => void;
  archiving: boolean;
}

function CategoryScreen({
  category,
  leads,
  totalInCategory,
  search,
  onSearchChange,
  selectedIds,
  onToggleLead,
  onSelectAll,
  onClearSelection,
  onBack,
  onArchive,
  archiving,
}: CategoryScreenProps) {
  const meta = CATEGORY_META[category];
  const allVisibleSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.id));
  const filtered = leads.length;
  const isSearching = search.trim().length > 0;

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={onBack}
        className="tap -mt-1 flex items-center gap-1 text-[11px] font-semibold text-am hover:text-on"
      >
        <Icon name="chevron_left" className="!text-[16px]" />
        Voltar
      </button>

      <div className="rounded-card-sm bg-sf-c px-3 py-2 text-[11px] text-on-2">
        <div className="flex items-center gap-1 font-semibold text-on">
          {meta.emoji} {meta.label}
        </div>
        <div className="mt-0.5 text-on-3">{meta.description}</div>
      </div>

      <div className="relative">
        <Icon
          name="search"
          className="!text-[16px] absolute left-3 top-1/2 -translate-y-1/2 text-on-3 pointer-events-none"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Buscar nos ${totalInCategory} leads…`}
          className="pl-9"
        />
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px]">
        <div className="text-on-3">
          {selectedIds.size > 0
            ? `${selectedIds.size} selecionado${selectedIds.size === 1 ? '' : 's'}`
            : isSearching
              ? `${filtered} de ${totalInCategory}`
              : `${totalInCategory} leads`}
        </div>
        <div className="flex gap-2">
          {selectedIds.size > 0 ? (
            <button
              onClick={onClearSelection}
              className="tap font-semibold text-on-3 hover:text-on"
            >
              Limpar
            </button>
          ) : null}
          {leads.length > 0 ? (
            <button
              onClick={allVisibleSelected ? onClearSelection : onSelectAll}
              className="tap font-semibold text-am hover:text-on"
            >
              {allVisibleSelected ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[40vh] overflow-y-auto">
        {leads.length === 0 ? (
          <div className="py-6 text-center text-[11px] text-on-3">
            {isSearching ? 'Nenhum lead nesta busca' : 'Sem leads aqui'}
          </div>
        ) : (
          leads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              selected={selectedIds.has(lead.id)}
              onToggle={() => onToggleLead(lead.id)}
            />
          ))
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="surface" onClick={onBack} className="flex-1" disabled={archiving}>
          Voltar
        </Button>
        <Button
          variant="gp"
          onClick={onArchive}
          disabled={selectedIds.size === 0 || archiving}
          className="flex-1"
        >
          {archiving
            ? 'Arquivando…'
            : selectedIds.size === 0
              ? 'Arquivar'
              : `Arquivar ${selectedIds.size}`}
        </Button>
      </div>

      <div className="text-center text-[10px] text-on-3">
        Arquivar é reversível. Os leads ficam ocultos da lista principal.
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// LeadRow
// ────────────────────────────────────────────────

interface LeadRowProps {
  lead: Lead;
  selected: boolean;
  onToggle: () => void;
}

function LeadRow({ lead, selected, onToggle }: LeadRowProps) {
  const subtitle = lead.organization || lead.title || lead.phone || '';
  return (
    <button
      onClick={onToggle}
      className={`tap flex items-center gap-3 rounded-card-sm px-3 py-2 text-left transition-colors ${
        selected ? 'bg-am/15 ring-1 ring-am/40' : 'bg-sf-c hover:bg-sf-hi'
      }`}
    >
      <div
        className={`grid h-5 w-5 shrink-0 place-items-center rounded border-2 transition-colors ${
          selected ? 'border-am bg-am text-bg' : 'border-on-3 bg-transparent'
        }`}
      >
        {selected ? <Icon name="check" className="!text-[14px]" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold text-on">{lead.name}</div>
        {subtitle ? (
          <div className="truncate text-[10px] text-on-3">{subtitle}</div>
        ) : null}
      </div>
      {lead.classificationConfidence !== null ? (
        <div className="shrink-0 rounded-full bg-sf-hi px-1.5 py-0.5 text-[9px] font-semibold text-on-3">
          {lead.classificationConfidence}%
        </div>
      ) : null}
    </button>
  );
}
