import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function AppShell() {
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
    </div>
  );
}
