import { useState } from 'react';
import type { Lead } from '@ltypes/domain';
import { useLeads } from '../hooks/useLeads';
import { AddLeadForm } from '../components/AddLeadForm';
import { LeadCard } from '../components/LeadCard';
import { LeadModal } from '../components/LeadModal';
import { LeadFilters, type FilterValue } from '../components/LeadFilters';
import { IcebreakerCarousel } from '../components/IcebreakerCarousel';
import { ContactImporter } from '../components/ContactImporter';
import { PipelineBar } from '../components/PipelineBar';
import { EmptyState } from '@shared/ui/EmptyState';
import { StatCard } from '@shared/ui/StatCard';

export function ProspectorPage() {
  const { data: leads = [], isLoading } = useLeads();
  const [filter, setFilter] = useState<FilterValue>('todos');
  const [editing, setEditing] = useState<Lead | null>(null);

  const filtered = filter === 'todos' ? leads : leads.filter((l) => l.status === filter);

  const hot = leads.filter((l) => l.status === 'quente').length;
  const closed = leads.filter((l) => l.status === 'fechado').length;

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
        <LeadFilters active={filter} onChange={setFilter} leads={leads} />

        {isLoading ? (
          <div className="py-6 text-center text-xs text-on-3">Carregando leads…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="person_search"
            title={filter === 'todos' ? 'Sem leads ainda' : 'Sem leads neste status'}
            description={
              filter === 'todos'
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
    </div>
  );
}
