import { createContext, useCallback, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@lib/cn';
import { Icon } from '@shared/ui/Icon';

export type ToastType = 'success' | 'error' | 'info' | 'xp';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  icon?: string;
}

export interface ToastContextValue {
  toast: (message: string, type?: ToastType, icon?: string) => void;
  xp: (amount: number, reason?: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextValue | null>(null);

const STYLE: Record<ToastType, string> = {
  success: 'bg-em text-white',
  error: 'bg-rb text-white',
  info: 'bg-sf-hi text-on',
  xp: 'bg-gp text-white shadow-glow-am',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((message: string, type: ToastType = 'info', icon?: string) => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, message, type, icon }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const value: ToastContextValue = {
    toast: push,
    xp: (amount, reason) => push(`+${amount} XP${reason ? ` · ${reason}` : ''}`, 'xp', 'bolt'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
          <AnimatePresence>
            {items.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={cn(
                  'pointer-events-auto flex items-center gap-2 rounded-card-sm px-4 py-2.5 text-sm font-semibold shadow-amb',
                  STYLE[t.type],
                )}
              >
                {t.icon && <Icon name={t.icon} filled className="!text-[18px]" />}
                {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
