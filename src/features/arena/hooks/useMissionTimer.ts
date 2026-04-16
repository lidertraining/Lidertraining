import { useEffect, useState } from 'react';

/** Retorna segundos restantes até expiresAt, atualiza a cada segundo. */
export function useMissionTimer(expiresAt: string | null): number {
  const [remaining, setRemaining] = useState(() => calcRemaining(expiresAt));

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(0);
      return;
    }
    const id = window.setInterval(() => {
      setRemaining(calcRemaining(expiresAt));
    }, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  return remaining;
}

function calcRemaining(iso: string | null): number {
  if (!iso) return 0;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}
