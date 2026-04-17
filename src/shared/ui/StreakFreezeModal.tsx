import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { useProfile } from '@shared/hooks/useProfile';
import { supabase } from '@lib/supabase';
import { useToast } from '@shared/hooks/useToast';

interface StreakFreezeModalProps {
  open: boolean;
  onClose: () => void;
}

const FREEZE_COST_XP = 200;

/**
 * Modal para comprar Streak Freeze por 200 XP.
 * Protege 1 dia de streak caso o usuário não abra o app.
 */
export function StreakFreezeModal({ open, onClose }: StreakFreezeModalProps) {
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [buying, setBuying] = useState(false);

  if (!open || !profile) return null;

  const canAfford = profile.xp >= FREEZE_COST_XP;
  const freezes = profile.freezes;

  const buyFreeze = async () => {
    if (!canAfford) return;
    setBuying(true);
    try {
      // RPC atômica: valida saldo, deduz XP e incrementa freezes numa transação
      const { error } = await supabase.rpc('buy_streak_freeze');
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ['profile'] });
      toast('Freeze comprado! Você tem proteção extra.', 'success', 'ac_unit');
      onClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao comprar', 'error');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ov/60 px-6">
      <Card variant="surface" className="w-full max-w-sm animate-fade-up p-6" glow="am">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cy/20">
            <Icon name="ac_unit" filled className="!text-[28px] text-cy" />
          </div>

          <div>
            <h2 className="serif text-xl font-bold">Streak Freeze</h2>
            <p className="mt-1 text-sm text-on-2">
              Protege seu streak por 1 dia. Se você não abrir o app amanhã, o freeze é
              consumido e seu streak não zera.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-card bg-sf-top/50 px-5 py-3">
            <div className="text-center">
              <div className="serif text-2xl font-bold text-cy">{freezes}</div>
              <div className="text-[10px] text-on-3">disponíveis</div>
            </div>
            <div className="h-8 w-px bg-sf-top" />
            <div className="text-center">
              <div className="serif text-2xl font-bold text-am">{FREEZE_COST_XP}</div>
              <div className="text-[10px] text-on-3">XP por unidade</div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Button
              variant="ge"
              fullWidth
              onClick={buyFreeze}
              disabled={!canAfford || buying}
            >
              {buying
                ? 'Comprando…'
                : canAfford
                  ? `Comprar Freeze · -${FREEZE_COST_XP} XP`
                  : `XP insuficiente (precisa ${FREEZE_COST_XP})`}
            </Button>
            <button
              onClick={onClose}
              className="text-[11px] text-on-3 hover:text-on-2"
            >
              Fechar
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
