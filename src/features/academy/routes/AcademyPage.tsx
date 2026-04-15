import { AudioList } from '../components/AudioList';
import { VIP600Card } from '../components/VIP600Card';
import { GoldenRulesCard } from '../components/GoldenRulesCard';
import { MOSPanel } from '../components/MOSPanel';
import { OneOnOneCard } from '../components/OneOnOneCard';
import { PresentationFormatsCard } from '../components/PresentationFormatsCard';
import { FinancialEdu } from '../components/FinancialEdu';

export function AcademyPage() {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <header className="animate-fade-up">
        <div className="text-sm text-on-3">Base s\u00f3lida de forma\u00e7\u00e3o</div>
        <h1 className="serif text-3xl font-bold">Academia</h1>
      </header>

      <AudioList />
      <VIP600Card />
      <GoldenRulesCard />
      <MOSPanel />
      <OneOnOneCard />
      <PresentationFormatsCard />
      <FinancialEdu />
    </div>
  );
}
