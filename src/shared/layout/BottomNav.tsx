import { NavLink } from 'react-router-dom';
import { ROUTES } from '@config/routes';
import { Icon } from '@shared/ui/Icon';
import { cn } from '@lib/cn';

const ITEMS = [
  { to: ROUTES.DASHBOARD, icon: 'home', label: 'Início', end: true },
  { to: ROUTES.JOURNEY, icon: 'map', label: 'Jornada', end: false },
  { to: ROUTES.PROSPECTOR, icon: 'person_add', label: 'Leads', end: false },
  { to: ROUTES.ACADEMY, icon: 'school', label: 'Academia', end: false },
  { to: ROUTES.LEADER, icon: 'groups', label: 'Líder', end: false },
] as const;

export function BottomNav() {
  return (
    <nav
      className="glass fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-page items-center justify-around px-2"
      style={{ height: 'var(--nav-h)' }}
    >
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              'tap flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition',
              isActive ? 'text-am' : 'text-on-3',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                name={item.icon}
                filled={isActive}
                className={cn('!text-[22px]', isActive && 'text-am')}
              />
              <span>{item.label}</span>
              {isActive && <span className="h-1 w-1 rounded-full bg-am" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
