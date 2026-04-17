import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Profile } from '@ltypes/domain';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { ROUTES, buildRoute } from '@config/routes';
import { cn } from '@lib/cn';

interface TodayCardProps {
  profile: Profile;
}

interface TodayTask {
  id: string;
  icon: string;
  title: string;
  description: string;
  href: string;
  priority: number;
}

const STORAGE_PREFIX = 'lt_today_done_';

/**
 * Card "Hoje em 3 passos" — micro-ações priorizadas do dia,
 * personalizadas pelo estado do perfil. Cada uma marcável como feita (persiste localStorage por data).
 */
export function TodayCard({ profile }: TodayCardProps) {
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `${STORAGE_PREFIX}${today}`;

  const [done, setDone] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const tasks = useMemo(() => buildTasks(profile), [profile]);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        /* empty */
      }
      return next;
    });
  };

  const doneCount = tasks.filter((t) => done.has(t.id)).length;
  const allDone = doneCount === tasks.length && tasks.length > 0;

  return (
    <Card variant="surface" className="flex flex-col gap-3 p-5" glow="am">
      <div className="flex items-center gap-2">
        <Icon name="today" filled className="!text-[20px] text-am" />
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
            Hoje em 3 passos
          </div>
          <div className="serif text-base font-bold">
            {allDone ? 'Dia fechado! 🎉' : `${doneCount}/${tasks.length} concluído(s)`}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.map((task) => {
          const isDone = done.has(task.id);
          return (
            <div
              key={task.id}
              className={cn(
                'flex items-center gap-3 rounded-card bg-sf-top/40 p-3 transition',
                isDone && 'opacity-60',
              )}
            >
              <button
                type="button"
                onClick={() => toggle(task.id)}
                aria-label="Marcar como feito"
                className={cn(
                  'tap flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition',
                  isDone
                    ? 'bg-em text-white'
                    : 'border-2 border-sf-top bg-sf-void text-transparent',
                )}
              >
                <Icon name="check" filled className="!text-[14px]" />
              </button>
              <Link to={task.href} className="flex flex-1 items-center gap-2 min-w-0">
                <Icon name={task.icon} filled className="!text-[16px] text-am shrink-0" />
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'truncate text-sm font-semibold',
                      isDone && 'line-through',
                    )}
                  >
                    {task.title}
                  </div>
                  <div className="truncate text-[10px] text-on-3">{task.description}</div>
                </div>
                <Icon name="chevron_right" className="!text-[14px] text-on-3" />
              </Link>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function buildTasks(profile: Profile): TodayTask[] {
  const tasks: TodayTask[] = [];

  // Sempre: streak check
  if (profile.streak === 0) {
    tasks.push({
      id: 'streak-start',
      icon: 'local_fire_department',
      title: 'Comece um novo streak',
      description: 'Qualquer ação hoje conta. 1 lead, 1 áudio, 1 passo.',
      href: ROUTES.PROSPECTOR,
      priority: 1,
    });
  } else {
    tasks.push({
      id: 'streak-keep',
      icon: 'local_fire_department',
      title: `Mantenha seu streak de ${profile.streak} dias`,
      description: 'Não deixa zerar hoje. Faz pelo menos 1 ação.',
      href: ROUTES.PROSPECTOR,
      priority: 1,
    });
  }

  // FIR ou Jornada
  if (!profile.firCompleted) {
    tasks.push({
      id: 'fir-next',
      icon: 'flag',
      title: 'Avance no FIR',
      description: `Etapa ${profile.firStep + 1}/8 do onboarding`,
      href: ROUTES.FIR,
      priority: 2,
    });
  } else if (profile.journeyStep < 11) {
    tasks.push({
      id: 'journey-step',
      icon: 'route',
      title: `Passo ${profile.journeyStep + 1} da Jornada`,
      description: 'Continue a formação onde parou',
      href: buildRoute.journeyStep(profile.journeyStep),
      priority: 2,
    });
  }

  // Sempre: prospecção / leads
  if (profile.contacts < 50) {
    tasks.push({
      id: 'leads-add',
      icon: 'person_add',
      title: 'Adicione 3 leads novos',
      description: `Sua lista tem ${profile.contacts}/50`,
      href: ROUTES.PROSPECTOR,
      priority: 3,
    });
  } else {
    tasks.push({
      id: 'leads-work',
      icon: 'phone_in_talk',
      title: 'Trabalhe 5 leads do CRM',
      description: 'Follow-up com quentes e mornos',
      href: ROUTES.PROSPECTOR,
      priority: 3,
    });
  }

  return tasks.slice(0, 3);
}
