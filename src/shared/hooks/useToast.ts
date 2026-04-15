import { useContext } from 'react';
import { ToastContext } from '@shared/providers/ToastProvider';
import type { ToastContextValue } from '@shared/providers/ToastProvider';

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>');
  return ctx;
}
