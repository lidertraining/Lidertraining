import type { Profile } from '@ltypes/domain';
import { StatCard } from '@shared/ui/StatCard';
import { formatXP, formatBRL } from '@lib/format';

interface StatsGridProps {
  profile: Profile;
}

export function StatsGrid({ profile }: StatsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCard icon="person_add" label="Contatos" value={formatXP(profile.contacts)} />
      <StatCard icon="shopping_cart" label="Vendas" value={formatXP(profile.sales)} />
      <StatCard icon="groups" label="Equipe" value={formatXP(profile.teamCount)} />
      <StatCard icon="inventory_2" label="PG" value={formatBRL(Number(profile.pg))} />
      <StatCard icon="local_mall" label="PP" value={formatBRL(Number(profile.pp))} />
      <StatCard icon="diamond" label="VIP" value={`${profile.vip}/600`} />
    </div>
  );
}
