import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { Confetti } from '@shared/ui/Confetti';

interface LevelUpModalProps {
  open: boolean;
  onClose: () => void;
  newLevel: string;
  xp: number;
  userName: string;
}

/**
 * Modal de celebração ao atingir novo nível.
 * Confetti + card dourado com novo título.
 */
export function LevelUpModal({ open, onClose, newLevel, xp, userName }: LevelUpModalProps) {
  if (!open) return null;

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ov/60 px-6">
      <Confetti active={open} duration={4000} />
      <Card variant="surface" className="w-full max-w-sm animate-fade-up p-6" glow="gd">
        <div className="flex flex-col items-center gap-5 text-center">
          {/* Crown icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gg">
            <Icon name="military_tech" filled className="!text-[36px] text-sf-void" />
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gd">
              Parabéns!
            </div>
            <h2 className="serif mt-1 text-2xl font-bold">Nível {newLevel}</h2>
          </div>

          {/* Certificado inline */}
          <div className="w-full rounded-card border border-gd/30 bg-sf-top/50 p-4">
            <div className="text-[9px] font-bold uppercase tracking-widest text-gd">
              Certificado de nível
            </div>
            <div className="serif mt-2 text-lg font-bold">{userName}</div>
            <div className="mt-1 text-xs text-on-2">
              Atingiu o nível <strong className="text-gd">{newLevel}</strong> com{' '}
              <strong className="text-am">{xp.toLocaleString()} XP</strong>
            </div>
            <div className="mt-3 text-[10px] italic text-on-3">{today}</div>
            <div className="mt-2 flex justify-center">
              <Icon name="verified" filled className="!text-[24px] text-gd" />
            </div>
          </div>

          <Button variant="ge" fullWidth onClick={onClose}>
            Continuar a jornada
          </Button>
        </div>
      </Card>
    </div>
  );
}
