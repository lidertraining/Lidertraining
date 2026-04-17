import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTeamLearning } from '../hooks/useTeamLearning';
import { TeamLearningStats } from '../components/TeamLearningStats';
import { TeamAlerts } from '../components/TeamAlerts';
import { LearningMemberCard } from '../components/LearningMemberCard';
import { InvitesPanel } from '../components/InvitesPanel';
import { EmptyState } from '@shared/ui/EmptyState';
import { Tabs } from '@shared/ui/Tabs';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ROUTES } from '@config/routes';

type TabId = 'equipe' | 'rede' | 'convites';

const TABS: { id: TabId; label: string }[] = [
  { id: 'equipe', label: 'Equipe' },
  { id: 'rede', label: 'Rede completa' },
  { id: 'convites', label: 'Convites' },
];

export function LeaderPage() {
  const { data: members = [], isLoading } = useTeamLearning(6);
  const [tab, setTab] = useState<TabId>('equipe');

  const direct = members.filter((m) => m.depth === 1);
  const all = members;

  return (
    <div className="flex flex-col gap-5 pt-2">
      <header className="animate-fade-up">
        <div className="text-sm text-on-3">Gestão da sua equipe</div>
        <h1 className="serif text-3xl font-bold">Líder</h1>
      </header>

      <Tabs items={TABS} active={tab} onChange={setTab} />

      {tab === 'equipe' && (
        <>
          <TeamLearningStats members={members} />
          <TeamAlerts members={members} />

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="serif text-lg font-bold">Consultores diretos</h2>
              <span className="text-xs text-on-3">{direct.length}</span>
            </div>

            {isLoading ? (
              <div className="py-6 text-center text-xs text-on-3">Carregando equipe…</div>
            ) : direct.length === 0 ? (
              <EmptyState
                icon="group_add"
                title="Equipe vazia"
                description="Na aba Convites você encontra seu código pessoal para compartilhar e começar a formar sua rede."
              />
            ) : (
              <div className="flex flex-col gap-2">
                {direct.map((m) => (
                  <LearningMemberCard key={m.id} member={m} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {tab === 'rede' && (
        <>
          <Link to={ROUTES.NETWORK}>
            <Card variant="surface" className="tap flex items-center gap-3 p-4 hover-glow">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gp">
                <Icon name="account_tree" filled className="!text-[20px] text-white" />
              </div>
              <div className="flex-1">
                <div className="serif text-base font-bold">Árvore genealógica</div>
                <div className="text-[11px] text-on-3">
                  Visualização hierárquica até 6 níveis
                </div>
              </div>
              <Icon name="chevron_right" className="!text-[18px] text-on-3" />
            </Card>
          </Link>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="serif text-lg font-bold">Toda a rede</h2>
              <span className="text-xs text-on-3">{all.length} pessoas</span>
            </div>
            {isLoading ? (
              <div className="py-6 text-center text-xs text-on-3">Carregando…</div>
            ) : all.length === 0 ? (
              <EmptyState
                icon="account_tree"
                title="Rede vazia"
                description="Convide consultores na aba Convites para começar."
              />
            ) : (
              <div className="flex flex-col gap-2">
                {all.map((m) => (
                  <LearningMemberCard key={m.id} member={m} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {tab === 'convites' && <InvitesPanel />}
    </div>
  );
}
