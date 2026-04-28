import { useMemo, useState } from 'react';
import type { Lead } from '@ltypes/domain';
import { useLeads } from '../hooks/useLeads';
import { AddLeadForm } from '../components/AddLeadForm';
import { LeadCard } from '../components/LeadCard';
import { LeadModal } from '../components/LeadModal';
import { LeadFilters, type FilterValue } from '../components/LeadFilters';
import { IcebreakerCarousel } from '../components/IcebreakerCarousel';
import { ContactImporter } from '../components/ContactImporter';
import { PipelineBar } from '../components/PipelineBar';
import { RevisarListaModal } from '../components/RevisarListaModal';
import { EmptyState } from '@shared/ui/EmptyState';
import { StatCard } from '@shared/ui/StatCard';
import { Icon } from '@shared/ui/Icon';

export function ProspectorPage() {
  const { data: leads = [], isLoading } = useLeads();
  const [filter, setFilter] = useState<FilterValue>('todos');
  const [editing, setEditing] = useState<Lead | null>(null);
  const [search, setSearch] = useState('');
  const [revisarOpen, setRevisarOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = filter === 'todos' ? leads : leads.filter((l) => l.status === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.phone ?? '').toLowerCase().includes(q) ||
          (l.organization ?? '').toLowerCase().includes(q) ||
          (l.title ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [leads, filter, search]);

  const hot = leads.filter((l) => l.status === 'quente').length;
  const closed = leads.filter((l) => l.status === 'fechado').length;
  const hasClassified = leads.some((l) => l.category !== null);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <header className="animate-fade-up">
        <div className="text-sm text-on-3">Seu pipeline de leads</div>
        <h1 className="serif text-3xl font-bold">Prospector</h1>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <StatCard icon="group" label="Total" value={leads.length} />
        <StatCard icon="local_fire_department" label="Quentes" value={hot} />
        <StatCard icon="handshake" label="Fechados" value={closed} />
      </div>

      <PipelineBar
        frio={leads.filter((l) => l.status === 'frio').length}
        morno={leads.filter((l) => l.status === 'morno').length}
        quente={hot}
        fechado={closed}
      />

      <IcebreakerCarousel />
      <ContactImporter />
      <AddLeadForm />

      <div className="flex flex-col gap-3">
        {leads.length > 0 ? (
          <div className="relative">
            <Icon
              name="search"
              className="!text-[16px] absolute left-3 top-1/2 -translate-y-1/2 text-on-3 pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, telefone, empresa…"
              className="w-full rounded-card-sm border border-sf-hi bg-sf-c py-2.5 pl-9 pr-9 text-[13px] text-on placeholder:text-on-3 focus:border-am focus:outline-none"
            />
            {search ? (
              <button
                onClick={() => setSearch('')}
                className="tap absolute right-2 top-1/2 -translate-y-1/2 text-on-3 hover:text-on"
                aria-label="Limpar busca"
              >
                <Icon name="close" className="!text-[16px]" />
              </button>
            ) : null}
          </div>
        ) : null}

        {hasClassified ? (
          <button
            onClick={() => setRevisarOpen(true)}
            className="tap surface flex items-center gap-3 px-3 py-2.5 hover-glow"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-am/15">
              <Icon name="auto_awesome" filled className="!text-[18px] text-am" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-[13px] font-semibold text-on">Revisar lista</div>
              <div className="truncate text-[10px] text-on-3">
                Família, conhecidos, profissionais — organize com inteligência
              </div>
            </div>
            <Icon name="chevron_right" className="!text-[18px] shrink-0 text-on-3" />
          </button>
        ) : null}

        <LeadFilters active={filter} onChange={setFilter} leads={leads} />

        {isLoading ? (
          <div className="py-6 text-center text-xs text-on-3">Carregando leads…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="person_search"
            title={
              search
                ? 'Nenhum lead com essa busca'
                : filter === 'todos'
                  ? 'Sem leads ainda'
                  : 'Sem leads neste status'
            }
            description={
              search
                ? 'Tente outra palavra ou limpe o filtro.'
                : filter === 'todos'
                  ? 'Adicione seu primeiro contato acima para começar.'
                  : 'Tente outro filtro ou adicione um novo lead.'
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onClick={() => setEditing(lead)} />
            ))}
          </div>
        )}
      </div>

      <LeadModal lead={editing} onClose={() => setEditing(null)} />

      <RevisarListaModal
        open={revisarOpen}
        onClose={() => setRevisarOpen(false)}
        leads={leads}
      />
    </div>
  );
}
