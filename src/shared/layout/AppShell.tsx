import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { DailyPillModal } from '@shared/ui/DailyPillModal';
import { LevelUpModal } from '@shared/ui/LevelUpModal';
import { useProfile } from '@shared/hooks/useProfile';

export function AppShell() {
  const { data: profile } = useProfile();
  const prevLevel = useRef(profile?.level);
  const [levelUp, setLevelUp] = useState<{
    newLevel: string;
    xp: number;
    userName: string;
  } | null>(null);

  useEffect(() => {
    if (!profile) return;
    if (prevLevel.current && prevLevel.current !== profile.level) {
      setLevelUp({
        newLevel: profile.level,
        xp: profile.xp,
        userName: profile.name,
      });
    }
    prevLevel.current = profile.level;
  }, [profile?.level, profile?.xp, profile?.name, profile]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-page flex-col bg-sf-void">
      <Header />
      <main
        className="flex-1 px-4 pb-20 pt-[calc(var(--hdr-h)+16px)]"
        style={{ paddingBottom: 'calc(var(--nav-h) + 20px)' }}
      >
        <Outlet />
      </main>
      <BottomNav />
      <DailyPillModal />
      {levelUp && (
        <LevelUpModal
          open={!!levelUp}
          onClose={() => setLevelUp(null)}
          newLevel={levelUp.newLevel}
          xp={levelUp.xp}
          userName={levelUp.userName}
        />
      )}
    </div>
  );
}
