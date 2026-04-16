import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@config/routes';
import { Icon } from '@shared/ui/Icon';
import { Avatar } from '@shared/ui/Avatar';
import { useProfile } from '@shared/hooks/useProfile';
import { formatXP } from '@lib/format';
import { useNotifications } from '@features/notifications/hooks/useNotifications';
import { NotificationsModal } from '@features/notifications/components/NotificationsModal';
import { StreakFreezeModal } from '@shared/ui/StreakFreezeModal';
import { cn } from '@lib/cn';

export function Header() {
  const { data: profile } = useProfile();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [freezeOpen, setFreezeOpen] = useState(false);

  const energy = profile?.energy ?? 0;
  const maxEnergy = profile?.maxEnergy ?? 5;
  const streak = profile?.streak ?? 0;
  const energyPct = maxEnergy > 0 ? (energy / maxEnergy) * 100 : 0;

  return (
    <>
      <header
        className="glass fixed inset-x-0 top-0 z-40 mx-auto flex max-w-page items-center justify-between px-4"
        style={{ height: 'var(--hdr-h)' }}
      >
        {/* Energy + streak */}
        <div className="flex items-center gap-3">
          {/* Energy mini-bar */}
          <div className="flex items-center gap-1.5" title={`Energia ${energy}/${maxEnergy}`}>
            <Icon
              name="bolt"
              filled
              className={cn(
                '!text-[16px]',
                energy > 0 ? 'text-or' : 'text-on-3',
              )}
            />
            <div className="flex h-2.5 w-10 items-center overflow-hidden rounded-full bg-sf-top">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700',
                  energyPct > 50 ? 'bg-or' : energyPct > 20 ? 'bg-gd' : 'bg-rb',
                )}
                style={{ width: `${energyPct}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-on-3">{energy}</span>
          </div>

          {/* Streak flame (click abre freeze modal) */}
          <button
            type="button"
            onClick={() => setFreezeOpen(true)}
            className={cn(
              'tap flex items-center gap-1 rounded-chip px-2 py-0.5',
              streak > 0 ? 'bg-or/15' : 'bg-sf-top',
            )}
          >
            <span
              className={cn(
                'text-sm',
                streak > 0 && 'animate-pulse',
              )}
              aria-hidden
            >
              🔥
            </span>
            <span
              className={cn(
                'text-xs font-bold',
                streak > 0 ? 'streak-grad' : 'text-on-3',
              )}
            >
              {streak}
            </span>
          </button>
        </div>

        {/* Level + XP badge */}
        <Link
          to={ROUTES.PROFILE}
          className="tap flex items-center gap-2 rounded-chip bg-am-darker/30 px-3 py-1"
        >
          <Icon name="star" filled className="!text-[14px] text-am" />
          <div className="flex flex-col items-center leading-none">
            <span className="text-[9px] font-semibold text-am/70">
              {profile?.level ?? 'Master'}
            </span>
            <span className="text-xs font-bold text-am">
              {formatXP(profile?.xp ?? 0)}
            </span>
          </div>
        </Link>

        {/* Notif + Avatar */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Notificações"
            onClick={() => setNotifOpen(true)}
            className="tap relative text-on-2"
          >
            <Icon
              name="notifications"
              filled={unreadCount > 0}
              className={cn(
                '!text-[22px]',
                unreadCount > 0 && 'text-am',
              )}
            />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rb px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <Link to={ROUTES.PROFILE} aria-label="Perfil">
            <Avatar name={profile?.name ?? '?'} size="sm" />
          </Link>
        </div>
      </header>

      <NotificationsModal open={notifOpen} onClose={() => setNotifOpen(false)} />
      <StreakFreezeModal open={freezeOpen} onClose={() => setFreezeOpen(false)} />
    </>
  );
}
