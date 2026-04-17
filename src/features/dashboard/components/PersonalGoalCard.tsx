import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Profile } from '@ltypes/domain';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { supabase } from '@lib/supabase';
import { formatBRL } from '@lib/format';
import { useToast } from '@shared/hooks/useToast';

interface PersonalGoalCardProps {
  profile: Profile;
}

const STEP = 500;
const MIN_GOAL = 1000;
const MAX_GOAL = 50000;

export function PersonalGoalCard({ profile }: PersonalGoalCardProps) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const current = Number(profile.commCurrent) || 0;
  const storedGoal = Number(profile.commGoal) || 5000;

  const [editing, setEditing] = useState(false);
  const [goalValue, setGoalValue] = useState(storedGoal);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGoalValue(storedGoal);
  }, [storedGoal]);

  const pct = goalValue > 0 ? Math.min(100, (current / goalValue) * 100) : 0;
  const missing = Math.max(0, goalValue - current);

  const save = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ comm_goal: goalValue })
        .eq('id', profile.id);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ['profile'] });
      toast('Meta atualizada', 'success', 'flag');
      setEditing(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao salvar meta', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Icon name="flag" filled className="!text-[18px] text-gd" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Meta mensal</div>
          <div className="text-[10px] text-on-3">Sua projeção de comissão pro mês</div>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="tap text-[11px] font-semibold text-am"
          >
            Editar
          </button>
        )}
      </div>

      {!editing ? (
        <>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] text-on-3">Atual</div>
              <div className="serif text-xl font-bold text-em">{formatBRL(current)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-on-3">Meta</div>
              <div className="text-sm font-semibold text-on-2">{formatBRL(goalValue)}</div>
            </div>
          </div>
          <ProgressBar value={pct} fillClassName="bg-gg" />
          <div className="text-[11px] text-on-3">
            {missing > 0 ? (
              <>
                Faltam <span className="font-bold text-gd">{formatBRL(missing)}</span> pra bater
                a meta — {Math.round(pct)}% completo
              </>
            ) : (
              <span className="font-bold text-em">Meta batida! 🎉</span>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-3">Nova meta</span>
            <span className="serif text-lg font-bold text-am">{formatBRL(goalValue)}</span>
          </div>
          <input
            type="range"
            min={MIN_GOAL}
            max={MAX_GOAL}
            step={STEP}
            value={goalValue}
            onChange={(e) => setGoalValue(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sf-top accent-am"
          />
          <div className="flex justify-between text-[10px] text-on-3">
            <span>{formatBRL(MIN_GOAL)}</span>
            <span>{formatBRL(MAX_GOAL)}</span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="surface"
              className="flex-1"
              disabled={saving}
              onClick={() => {
                setGoalValue(storedGoal);
                setEditing(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="ge"
              className="flex-1"
              disabled={saving || goalValue === storedGoal}
              onClick={save}
            >
              {saving ? 'Salvando…' : 'Salvar meta'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
