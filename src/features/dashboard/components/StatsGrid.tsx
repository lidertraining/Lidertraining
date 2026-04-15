import type { Profile } from '@types/domain';
import { StatCard } from '@shared/ui/StatCard';
import { formatXP } from '@lib/format';

interface StatsGridProps {
  profile: Profile;
}

export function StatsGrid({ profile }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard icon="person" label="Contatos" value={formatXP(profile.contacts)} />
      <StatCard icon="shopping_cart" label="Vendas" value={formatXP(profile.sales)} />
      <StatCard icon="group" label="Equipe" value={formatXP(profile.teamCount)} />
      <StatCard icon="workspace_premium" label="VIP 600" value={`${profile.vip}/600`} />
    </div>
  );
}
