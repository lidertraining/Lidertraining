import { Link } from 'react-router-dom';
import { ROUTES } from '@config/routes';
import { Icon } from '@shared/ui/Icon';
import { Avatar } from '@shared/ui/Avatar';
import { useProfile } from '@shared/hooks/useProfile';
import { formatXP } from '@lib/format';

export function Header() {
  const { data: profile } = useProfile();

  return (
    <header
      className="glass fixed inset-x-0 top-0 z-40 mx-auto flex max-w-page items-center justify-between px-4"
      style={{ height: 'var(--hdr-h)' }}
    >
      {/* Energy + streak */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs font-bold text-or">
          <Icon name="bolt" filled className="!text-[16px]" />
          <span>{profile?.energy ?? 0}</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold streak-grad">
          <span aria-hidden>\u{1F525}</span>
          <span className="text-on">{profile?.streak ?? 0}</span>
        </div>
      </div>

      {/* XP */}
      <div className="flex items-center gap-2 rounded-chip bg-am-darker/30 px-3 py-1">
        <Icon name="star" filled className="!text-[14px] text-am" />
        <span className="text-xs font-bold text-am">{formatXP(profile?.xp ?? 0)} XP</span>
      </div>

      {/* Notif + Avatar */}
      <div className="flex items-center gap-3">
        <button aria-label="Notifica\u00e7\u00f5es" className="tap relative text-on-2">
          <Icon name="notifications" className="!text-[22px]" />
        </button>
        <Link to={ROUTES.PROFILE} aria-label="Perfil">
          <Avatar name={profile?.name ?? '?'} size="sm" />
        </Link>
      </div>
    </header>
  );
}
