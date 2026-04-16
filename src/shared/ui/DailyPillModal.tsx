import { useEffect, useState } from 'react';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { getDailyPill } from '@content/dailyPills';
import { useAddXP } from '@features/gamification/hooks/useAddXP';

const STORAGE_KEY = 'lt_daily_pill_date';

/**
 * Modal "Pílula do Dia" — aparece 1x por dia automaticamente.
 * Mostra um microlearning de 30s e dá +20 XP ao clicar "Entendi".
 */
export function DailyPillModal() {
  const [visible, setVisible] = useState(false);
  const { mutate: addXP } = useAddXP();

  const pill = getDailyPill();
  const today = new Date().toDateString();

  useEffect(() => {
    const last = localStorage.getItem(STORAGE_KEY);
    if (last === today) return;
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [today]);

  const dismiss = (claim: boolean) => {
    localStorage.setItem(STORAGE_KEY, today);
    setVisible(false);
    if (claim) {
      addXP({ amount: 20, reason: `Pílula: ${pill.title}` });
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ov/60 px-6">
      <Card variant="surface" className="w-full max-w-sm animate-fade-up p-6" glow="am">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gp">
            <Icon name={pill.icon} filled className="!text-[28px] text-white" />
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-am">
              Pílula do dia
            </div>
            <h2 className="serif mt-1 text-xl font-bold">{pill.title}</h2>
          </div>

          <p className="text-sm leading-relaxed text-on-2">{pill.body}</p>

          {pill.source && (
            <div className="text-[10px] italic text-on-3">Fonte: {pill.source}</div>
          )}

          <div className="flex w-full flex-col gap-2">
            <Button variant="ge" fullWidth onClick={() => dismiss(true)}>
              Entendi · +20 XP
            </Button>
            <button
              onClick={() => dismiss(false)}
              className="text-[11px] text-on-3 hover:text-on-2"
            >
              Pular hoje
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
