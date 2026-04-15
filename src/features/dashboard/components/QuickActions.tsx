import { Link } from 'react-router-dom';
import { Icon } from '@shared/ui/Icon';
import { ROUTES } from '@config/routes';

const ACTIONS = [
  { to: ROUTES.PROSPECTOR, icon: 'person_add', label: 'Lead' },
  { to: ROUTES.JOURNEY, icon: 'route', label: 'Jornada' },
  { to: ROUTES.ACADEMY, icon: 'headphones', label: 'Academia' },
  { to: ROUTES.LEADER, icon: 'groups', label: 'Equipe' },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ACTIONS.map((a) => (
        <Link
          key={a.to}
          to={a.to}
          className="tap surface-sm flex flex-col items-center gap-1 p-3 hover-glow"
        >
          <Icon name={a.icon} filled className="!text-[22px] text-am" />
          <span className="text-[10px] font-semibold text-on-2">{a.label}</span>
        </Link>
      ))}
    </div>
  );
}
