import { useEffect, useState } from 'react';
import type { Profile } from '@ltypes/domain';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { formatXP } from '@lib/format';
import { cn } from '@lib/cn';

interface WeeklyRecapProps {
  profile: Profile;
}

const STORAGE_KEY = 'lt_weekly_recap_seen';

/**
 * Aparece nas segundas-feiras. Mostra um resumo motivacional da semana que passou
 * com recomendação pra próxima. Desaparece depois de visto (1x por semana).
 */
export function WeeklyRecap({ profile }: WeeklyRecapProps) {
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const today = new Date();
    if (today.getDay() !== 1) return; // Só nas segundas

    const weekId = getWeekId(today);
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen === weekId) return;

    setVisible(true);
  }, []);

  const dismiss = () => {
    const today = new Date();
    const weekId = getWeekId(today);
    try {
      localStorage.setItem(STORAGE_KEY, weekId);
    } catch {
      /* empty */
    }
    setVisible(false);
  };

  if (!visible) return null;

  const weeklyXP = profile.weeklyXP;
  const streak = profile.streak;
  const quality = weeklyXP >= 500 ? 'great' : weeklyXP >= 200 ? 'good' : 'warm';

  const headline =
    quality === 'great'
      ? 'Semana de destaque!'
      : quality === 'good'
        ? 'Boa semana!'
        : 'Bora acelerar';

  const message =
    quality === 'great'
      ? `Você fez ${formatXP(weeklyXP)} XP e mantém ${streak} dias de streak. Mantém o ritmo!`
      : quality === 'good'
        ? `${formatXP(weeklyXP)} XP nos últimos 7 dias. Semana consistente — bora dobrar essa semana?`
        : `Semana devagar. Meta simples essa semana: +500 XP. Vamos juntos.`;

  return (
    <Card
      variant="surface"
      className={cn('flex flex-col gap-3 p-5 animate-fade-up')}
      glow={quality === 'great' ? 'gd' : 'am'}
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
            quality === 'great' ? 'bg-gg' : quality === 'good' ? 'bg-gp' : 'bg-or/30',
          )}
        >
          <Icon
            name={quality === 'great' ? 'emoji_events' : 'insights'}
            filled
            className="!text-[22px] text-white"
          />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
            Recap semanal · segunda-feira
          </div>
          <div className="serif text-lg font-bold">{headline}</div>
        </div>
        <button
          onClick={() => setMinimized(!minimized)}
          className="tap text-on-3"
          aria-label="Recolher"
        >
          <Icon name={minimized ? 'expand_more' : 'expand_less'} className="!text-[18px]" />
        </button>
      </div>

      {!minimized && (
        <>
          <p className="text-sm text-on-2">{message}</p>

          <div className="grid grid-cols-3 gap-2">
            <RecapStat icon="star" value={formatXP(weeklyXP)} label="XP semana" color="am" />
            <RecapStat icon="local_fire_department" value={streak} label="Streak" color="or" />
            <RecapStat
              icon="trending_up"
              value={Math.round(weeklyXP / 7)}
              label="Média/dia"
              color="em"
            />
          </div>

          <Button variant="surface" fullWidth onClick={dismiss}>
            Entendi, bora pra semana
          </Button>
        </>
      )}
    </Card>
  );
}

function RecapStat({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: string | number;
  label: string;
  color: string;
}) {
  const colorClass = color === 'am' ? 'text-am' : color === 'or' ? 'text-or' : 'text-em';
  return (
    <div className="flex flex-col items-center gap-1 rounded-card bg-sf-top/40 p-2 text-center">
      <Icon name={icon} filled className={`!text-[16px] ${colorClass}`} />
      <div className={`serif text-lg font-bold ${colorClass}`}>{value}</div>
      <div className="text-[9px] text-on-3">{label}</div>
    </div>
  );
}

function getWeekId(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - start.getTime()) / 86400000);
  const week = Math.ceil((days + start.getDay() + 1) / 7);
  return `${date.getFullYear()}-w${week}`;
}
