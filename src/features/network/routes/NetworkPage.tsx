import { useDownline } from '@features/leader/hooks/useDownline';
import { useProfile } from '@shared/hooks/useProfile';
import { NetworkNode } from '../components/NetworkNode';
import { Avatar } from '@shared/ui/Avatar';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { BackButton } from '@shared/layout/BackButton';
import { EmptyState } from '@shared/ui/EmptyState';
import { ROUTES } from '@config/routes';
import { formatXP } from '@lib/format';

export function NetworkPage() {
  const { data: members = [], isLoading } = useDownline(6);
  const { data: profile } = useProfile();

  const direct = members.filter((m) => m.depth === 1);
  const maxDepth = members.reduce((max, m) => Math.max(max, m.depth), 0);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <BackButton to={ROUTES.LEADER} label="Líder" />

      <header className="animate-fade-up">
        <div className="text-sm text-on-3">\u00c1rvore genealógica</div>
        <h1 className="serif text-3xl font-bold">Sua Rede</h1>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <Card variant="surface-sm" className="flex items-center gap-2 p-3">
          <Icon name="group" filled className="!text-[18px] text-am" />
          <div>
            <div className="text-[10px] text-on-3">Total</div>
            <div className="text-base font-bold">{members.length}</div>
          </div>
        </Card>
        <Card variant="surface-sm" className="flex items-center gap-2 p-3">
          <Icon name="bar_chart" filled className="!text-[18px] text-gd" />
          <div>
            <div className="text-[10px] text-on-3">Profundidade</div>
            <div className="text-base font-bold">{maxDepth} níveis</div>
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-on-3">Carregando rede…</div>
      ) : members.length === 0 ? (
        <EmptyState
          icon="account_tree"
          title="Rede vazia"
          description="Sua árvore aparece aqui quando você patrocinar seu primeiro consultor."
        />
      ) : (
        <section className="flex flex-col gap-2">
          {/* Raiz = você */}
          {profile && (
            <Card variant="surface" className="flex items-center gap-3 p-3" glow="am">
              <Avatar name={profile.name} size="md" />
              <div className="flex-1">
                <div className="text-sm font-bold">{profile.name} (você)</div>
                <div className="text-[10px] text-on-3">
                  {profile.level} · {formatXP(profile.xp)} XP
                </div>
              </div>
              <Icon name="workspace_premium" filled className="!text-[18px] text-am" />
            </Card>
          )}

          {/* Primeira geração ancorada em você */}
          <div className="ml-5 flex flex-col gap-1.5 border-l-2 border-am-darker/30 pl-3">
            {direct.map((m) => {
              const grandchildren = members.filter((x) => x.uplineId === m.id);
              return (
                <NetworkNode
                  key={m.id}
                  member={m}
                  nested={grandchildren}
                  allMembers={members}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
