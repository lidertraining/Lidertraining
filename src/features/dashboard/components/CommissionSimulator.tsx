import { useState } from 'react';
import type { Profile } from '@ltypes/domain';
import { Card } from '@shared/ui/Card';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { Icon } from '@shared/ui/Icon';
import { formatBRL } from '@lib/format';

interface CommissionSimulatorProps {
  profile: Profile;
}

const TICKET_MEDIO = 150;
const COMISSAO_VENDA = 0.25;
const COMISSAO_EQUIPE = 0.05;

export function CommissionSimulator({ profile }: CommissionSimulatorProps) {
  const current = Number(profile.commCurrent) || 0;
  const goal = Number(profile.commGoal) || 5000;
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;

  const [vendasMes, setVendasMes] = useState(10);
  const [equipeTamanho, setEquipeTamanho] = useState(profile.teamCount || 3);
  const [vendasEquipe, setVendasEquipe] = useState(5);

  const receitaDireta = vendasMes * TICKET_MEDIO * COMISSAO_VENDA;
  const receitaEquipe = equipeTamanho * vendasEquipe * TICKET_MEDIO * COMISSAO_EQUIPE;
  const totalProjetado = receitaDireta + receitaEquipe;

  return (
    <Card variant="surface" className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2 text-on-3">
        <Icon name="payments" filled className="!text-[16px]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          Simulador de comissão
        </span>
      </div>

      {/* Valores atuais */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] text-on-3">Atual este mês</div>
          <div className="serif text-2xl font-bold">{formatBRL(current)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-on-3">Meta</div>
          <div className="text-sm font-semibold text-on-2">{formatBRL(goal)}</div>
        </div>
      </div>
      <ProgressBar value={pct} fillClassName="bg-gg" />

      {/* Sliders de simulação */}
      <div className="mt-2 flex flex-col gap-3 rounded-card bg-sf-top/40 p-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-am">
          Simulação — ajuste os valores
        </div>

        <SliderRow
          label="Suas vendas/mês"
          value={vendasMes}
          min={0}
          max={50}
          onChange={setVendasMes}
          suffix="vendas"
        />
        <SliderRow
          label="Tamanho da equipe"
          value={equipeTamanho}
          min={0}
          max={50}
          onChange={setEquipeTamanho}
          suffix="pessoas"
        />
        <SliderRow
          label="Vendas/pessoa da equipe"
          value={vendasEquipe}
          min={0}
          max={20}
          onChange={setVendasEquipe}
          suffix="/pessoa"
        />

        <div className="mt-2 border-t border-sf-top/40 pt-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] text-on-3">Comissão direta</div>
              <div className="text-sm font-bold text-em">{formatBRL(receitaDireta)}</div>
            </div>
            <div className="text-[10px] text-on-3">+</div>
            <div>
              <div className="text-[10px] text-on-3">Bônus equipe</div>
              <div className="text-sm font-bold text-gd">{formatBRL(receitaEquipe)}</div>
            </div>
            <div className="text-[10px] text-on-3">=</div>
            <div className="text-right">
              <div className="text-[10px] text-on-3">Total projetado</div>
              <div className="serif text-xl font-bold text-am">{formatBRL(totalProjetado)}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-on-3">{label}</span>
        <span className="font-semibold text-on">
          {value} {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sf-top accent-am"
      />
    </div>
  );
}
