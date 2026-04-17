import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Confetti } from '@shared/ui/Confetti';
import { TOTAL_XP, FIR_STEP_META } from '../firTypes';
import type { FIRDados } from '../firTypes';
import { formatXP } from '@lib/format';

interface Props {
  dados: FIRDados;
  userName: string;
  onFinish: () => void;
}

export function FIRCelebracao({ dados, userName, onFinish }: Props) {
  const contatos = dados.contatos?.length ?? 0;
  const marco1m = dados.marcos['1m'] || 'Não definido';

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <Confetti active={true} duration={5000} />

      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gg">
        <Icon name="military_tech" filled className="!text-[44px] text-sf-void" />
      </div>

      <div>
        <div className="text-[10px] font-bold uppercase tracking-[.3em] text-gd">
          FIR Completa
        </div>
        <h1 className="serif mt-2 text-3xl font-bold">
          Parabéns, {userName.split(' ')[0]}!
        </h1>
        <p className="mt-2 text-sm text-on-2">
          Você completou a Ficha de Início Rápido. Poucos chegam até aqui tão preparados.
        </p>
      </div>

      {/* Métricas */}
      <div className="grid w-full max-w-xs grid-cols-3 gap-2">
        <MetricCard icon="star" value={formatXP(TOTAL_XP)} label="XP ganho" color="am" />
        <MetricCard icon="check_circle" value={FIR_STEP_META.length} label="Etapas" color="em" />
        <MetricCard icon="contacts" value={contatos} label="Contatos" color="gd" />
      </div>

      {/* Primeiro marco */}
      <Card variant="surface-sm" className="w-full max-w-xs p-4 text-left">
        <div className="flex items-center gap-2">
          <Icon name="flag" filled className="!text-[16px] text-gd" />
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-3">
            Sua meta de 1 mês
          </div>
        </div>
        <div className="mt-1 serif text-sm font-bold text-gd">{marco1m}</div>
      </Card>

      {/* Modo escolhido */}
      <div className="flex items-center gap-2 rounded-chip bg-am/10 px-4 py-2 text-[11px] font-semibold text-am">
        <Icon name="speed" filled className="!text-[14px]" />
        Modo {dados.modoOperacao === 'flex' ? 'Flex' : dados.modoOperacao === 'forte' ? 'Forte' : 'Elite'} ativado
      </div>

      {/* Primeira missão */}
      <Card variant="surface" className="w-full max-w-xs p-5" glow="am">
        <div className="flex flex-col items-center gap-2">
          <Icon name="bolt" filled className="!text-[24px] text-or" />
          <div className="text-[9px] font-bold uppercase tracking-[.2em] text-or">
            Missão desbloqueada
          </div>
          <div className="serif text-base font-bold">First Blood</div>
          <p className="text-[11px] text-on-3">
            Faça seu primeiro convite real usando o protocolo que você escolheu.
          </p>
        </div>
      </Card>

      <Button variant="ge" fullWidth onClick={onFinish} className="max-w-xs">
        Ir para o Dashboard
      </Button>
    </div>
  );
}

function MetricCard({ icon, value, label, color }: {
  icon: string; value: string | number; label: string; color: string;
}) {
  const c = color === 'am' ? 'text-am' : color === 'em' ? 'text-em' : 'text-gd';
  return (
    <Card variant="surface-sm" className="flex flex-col items-center gap-1 p-3">
      <Icon name={icon} filled className={`!text-[16px] ${c}`} />
      <div className={`serif text-lg font-bold ${c}`}>{value}</div>
      <div className="text-[9px] text-on-3">{label}</div>
    </Card>
  );
}
