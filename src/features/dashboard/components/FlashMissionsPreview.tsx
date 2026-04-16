import { Link } from 'react-router-dom';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { useMissions } from '@features/missions/hooks/useMissions';
import { ROUTES } from '@config/routes';

export function FlashMissionsPreview() {
  const { data = [] } = useMissions();
  const flashMissions = data.filter((m) => m.type === 'flash').slice(0, 2);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="serif text-lg font-bold">Missões Flash</h2>
        <Link to={ROUTES.ARENA} className="text-xs font-semibold text-am">
          Ver todas →
        </Link>
      </div>

      {flashMissions.length === 0 ? (
        <Card variant="surface-sm" className="p-4 text-center text-sm text-on-3">
          Sem missões flash ativas agora.
        </Card>
      ) : (
        flashMissions.map((m) => {
          const pct = Math.min(100, (m.progress / m.target) * 100);
          return (
            <Card key={m.id} variant="surface-sm" className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2">
                <Icon name="bolt" filled className="!text-[18px] text-or" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-[11px] text-on-3">{m.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-on-3">Recompensa</div>
                  <div className="text-xs font-bold text-am">+{m.rewardXP} XP</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ProgressBar value={pct} size="sm" fillClassName="bg-or" className="flex-1" />
                <span className="text-[11px] text-on-3">
                  {m.progress}/{m.target}
                </span>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
