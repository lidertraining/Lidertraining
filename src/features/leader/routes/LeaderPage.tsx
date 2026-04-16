import { Link } from 'react-router-dom';
import { useDownline } from '../hooks/useDownline';
import { TeamStats } from '../components/TeamStats';
import { TeamAlerts } from '../components/TeamAlerts';
import { TeamMemberCard } from '../components/TeamMemberCard';
import { EmptyState } from '@shared/ui/EmptyState';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ROUTES } from '@config/routes';

export function LeaderPage() {
  const { data: members = [], isLoading } = useDownline(6);
  const direct = members.filter((m) => m.depth === 1);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <header className="animate-fade-up">
        <div className="text-sm text-on-3">Gestão da sua equipe</div>
        <h1 className="serif text-3xl font-bold">Líder</h1>
      </header>

      <TeamStats members={members} />

      <Link to={ROUTES.NETWORK}>
        <Card variant="surface" className="tap flex items-center gap-3 p-4 hover-glow">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gp">
            <Icon name="account_tree" filled className="!text-[20px] text-white" />
          </div>
          <div className="flex-1">
            <div className="serif text-base font-bold">Ver árvore da rede</div>
            <div className="text-[11px] text-on-3">
              Até 6 níveis de profundidade
            </div>
          </div>
          <Icon name="chevron_right" className="!text-[18px] text-on-3" />
        </Card>
      </Link>

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
            description="Compartilhe seu código de convite no seu perfil para começar a construir sua rede."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {direct.map((m) => (
              <TeamMemberCard key={m.id} member={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
