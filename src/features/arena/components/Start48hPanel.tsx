import { useProfile } from '@shared/hooks/useProfile';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { formatDuration } from '@lib/format';
import { useEffect, useState } from 'react';

/**
 * START 48h: desafio inicial dos primeiros 2 dias p\u00f3s cadastro.
 * Conclu\u00eddo se firStep >= 3 antes do prazo.
 */
export function Start48hPanel() {
  const { data: profile } = useProfile();
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!profile?.createdAt) return;
    const expiresAt = new Date(profile.createdAt).getTime() + 48 * 3600 * 1000;
    const tick = () => setRemaining(Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [profile?.createdAt]);

  if (!profile) return null;

  const done = profile.firStep >= 3;
  const expired = remaining <= 0;

  return (
    <Card variant="surface" className="flex flex-col gap-3 p-4" glow="gd">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gg">
          <Icon name="rocket_launch" filled className="!text-[20px] text-sf-void" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gd">
            Desafio inicial
          </div>
          <div className="serif text-base font-bold">START 48h</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-on-3">Recompensa</div>
          <div className="text-sm font-bold text-gd">+300 XP</div>
        </div>
      </div>
      <p className="text-xs text-on-2">
        Complete as 3 primeiras etapas do FIR em 48 horas para ganhar um b\u00f4nus.
      </p>
      <ProgressBar value={Math.min(100, (profile.firStep / 3) * 100)} size="sm" fillClassName="bg-gg" />
      <div className="flex items-center gap-1 text-[11px]">
        <Icon name="timer" className="!text-[14px] text-on-3" />
        <span className={done ? 'text-em' : expired ? 'text-rb' : 'text-on-2'}>
          {done
            ? 'Desafio completo!'
            : expired
              ? 'Prazo expirado'
              : `Resta ${formatDuration(remaining)}`}
        </span>
      </div>
    </Card>
  );
}
