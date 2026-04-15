import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@shared/hooks/useProfile';
import { useJourneySteps } from '../hooks/useJourneyContent';
import { Button } from '@shared/ui/Button';
import { Tabs } from '@shared/ui/Tabs';
import { Icon } from '@shared/ui/Icon';
import { BackButton } from '@shared/layout/BackButton';
import { LearnTab } from '../components/LearnTab';
import { TasksTab } from '../components/TasksTab';
import { PracticeTab } from '../components/PracticeTab';
import { AgentsTab } from '../components/AgentsTab';
import { completeJourneyStep } from '../api/journey';
import { useToast } from '@shared/providers/ToastProvider';
import { ROUTES } from '@config/routes';

type TabId = 'aprender' | 'tarefas' | 'praticar' | 'agentes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'aprender', label: 'Aprender' },
  { id: 'tarefas', label: 'Tarefas' },
  { id: 'praticar', label: 'Praticar' },
  { id: 'agentes', label: 'Agentes' },
];

export function JourneyStepPage() {
  const { stepId = '0' } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { data: steps = [] } = useJourneySteps();
  const [tab, setTab] = useState<TabId>('aprender');
  const [finalizing, setFinalizing] = useState(false);

  const sid = Number(stepId);
  const step = steps.find((s) => s.id === sid);
  const isCurrent = profile?.journeyStep === sid;
  const isDone = (profile?.journeyStep ?? 0) > sid;

  if (!step) {
    return (
      <div className="pt-6 text-center text-sm text-on-3">Passo n\u00e3o encontrado</div>
    );
  }

  const handleComplete = async () => {
    setFinalizing(true);
    try {
      await completeJourneyStep(sid);
      qc.invalidateQueries({ queryKey: ['profile'] });
      toast('Passo conclu\u00eddo! +100 XP', 'xp', 'star');
      setTimeout(() => nav(ROUTES.JOURNEY), 400);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao concluir', 'error');
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-2">
      <BackButton to={ROUTES.JOURNEY} label="Todos os passos" />

      <header className="animate-fade-up">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
          Passo {sid + 1}
        </div>
        <h1 className="serif text-2xl font-bold">{step.name}</h1>
        <p className="text-sm text-on-3">{step.description}</p>
      </header>

      <Tabs items={TABS} active={tab} onChange={setTab} />

      <div>
        {tab === 'aprender' && <LearnTab step={step} />}
        {tab === 'tarefas' && <TasksTab stepId={sid} />}
        {tab === 'praticar' && <PracticeTab step={step} />}
        {tab === 'agentes' && <AgentsTab />}
      </div>

      {isCurrent && (
        <Button
          variant="ge"
          fullWidth
          onClick={handleComplete}
          disabled={finalizing}
          leftIcon={<Icon name="check_circle" filled className="!text-[18px]" />}
        >
          {finalizing ? 'Conclu\u00edndo\u2026' : 'Concluir passo \u00b7 +100 XP'}
        </Button>
      )}

      {isDone && (
        <div className="flex items-center justify-center gap-2 rounded-card bg-em/15 py-3 text-sm font-semibold text-em">
          <Icon name="verified" filled className="!text-[18px]" />
          Passo conclu\u00eddo
        </div>
      )}
    </div>
  );
}
