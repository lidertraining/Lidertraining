import { useState } from 'react';
import { AcademyProgress } from '../components/AcademyProgress';
import { AudioList } from '../components/AudioList';
import { VIP600Card } from '../components/VIP600Card';
import { GoldenRulesCard } from '../components/GoldenRulesCard';
import { MOSPanel } from '../components/MOSPanel';
import { OneOnOneCard } from '../components/OneOnOneCard';
import { PresentationFormatsCard } from '../components/PresentationFormatsCard';
import { FinancialEdu } from '../components/FinancialEdu';
import { Tabs } from '@shared/ui/Tabs';

type TabId = 'formacao' | 'ferramentas' | 'financeiro';

const TABS: { id: TabId; label: string }[] = [
  { id: 'formacao', label: 'Formação' },
  { id: 'ferramentas', label: 'Ferramentas' },
  { id: 'financeiro', label: 'Financeiro' },
];

export function AcademyPage() {
  const [tab, setTab] = useState<TabId>('formacao');

  return (
    <div className="flex flex-col gap-5 pt-2">
      <header className="animate-fade-up">
        <div className="text-sm text-on-3">Base sólida de formação</div>
        <h1 className="serif text-3xl font-bold">Academia</h1>
      </header>

      <AcademyProgress />

      <Tabs items={TABS} active={tab} onChange={setTab} />

      {tab === 'formacao' && (
        <div className="flex flex-col gap-6">
          <AudioList />
          <GoldenRulesCard />
        </div>
      )}

      {tab === 'ferramentas' && (
        <div className="flex flex-col gap-6">
          <MOSPanel />
          <OneOnOneCard />
          <PresentationFormatsCard />
        </div>
      )}

      {tab === 'financeiro' && (
        <div className="flex flex-col gap-6">
          <VIP600Card />
          <FinancialEdu />
        </div>
      )}
    </div>
  );
}
