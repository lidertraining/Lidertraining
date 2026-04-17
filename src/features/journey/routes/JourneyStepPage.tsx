import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@shared/hooks/useProfile';
import { useToast } from '@shared/hooks/useToast';
import { Button } from '@shared/ui/Button';
import { Icon } from '@shared/ui/Icon';
import { Confetti } from '@shared/ui/Confetti';
import { supabase } from '@lib/supabase';
import { ROUTES } from '@config/routes';
import { PASSOS_V2 } from '../jornada-v2-types';
import { JornadaShell } from '../components/JornadaShell';
import { PassoReflexivo } from '../components/arquetipos/PassoReflexivo';
import { PassoPlanejador } from '../components/arquetipos/PassoPlanejador';
import { PassoOperacional } from '../components/arquetipos/PassoOperacional';
import { PassoPerformatico } from '../components/arquetipos/PassoPerformatico';
import { PassoLideranca } from '../components/arquetipos/PassoLideranca';
import { completeJourneyStep } from '../api/journey';
import { isStepDone } from '@lib/bitmask';

export function JourneyStepPage() {
  const { stepId = '0' } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  const { toast } = useToast();

  const sid = Number(stepId);
  const passo = PASSOS_V2.find((p) => p.id === sid);
  const mask = profile?.journeyDoneMask ?? 0;
  const isDone = isStepDone(mask, sid);

  const [dados, setDados] = useState<Record<string, unknown>>({});
  const [loaded, setLoaded] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const saveTimer = useRef<number | null>(null);

  // Carrega dados do Supabase ao abrir
  useEffect(() => {
    if (!profile?.id) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('progresso_jornada')
          .select('dados')
          .eq('usuario_id', profile.id)
          .eq('passo_num', sid)
          .maybeSingle();
        if (!error && data?.dados && typeof data.dados === 'object') {
          setDados(data.dados as Record<string, unknown>);
        } else {
          // Fallback localStorage
          const raw = localStorage.getItem(`lt_journey_step_${sid}_draft`);
          if (raw) setDados(JSON.parse(raw));
        }
      } catch {
        const raw = localStorage.getItem(`lt_journey_step_${sid}_draft`);
        if (raw) {
          try { setDados(JSON.parse(raw)); } catch { /* noop */ }
        }
      }
      setLoaded(true);
    })();
  }, [profile?.id, sid]);

  // Auto-save com debounce 2s
  const updateDados = useCallback(
    (newDados: Record<string, unknown>) => {
      setDados(newDados);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(async () => {
        if (!profile?.id) return;
        try {
          const { error } = await supabase.from('progresso_jornada').upsert(
            {
              usuario_id: profile.id,
              passo_num: sid,
              status: 'em_andamento',
              dados: newDados,
              iniciado_em: new Date().toISOString(),
              atualizado_em: new Date().toISOString(),
            },
            { onConflict: 'usuario_id,passo_num' },
          );
          if (error) {
            // Fallback: salva no localStorage se tabela ainda não existir
            localStorage.setItem(
              `lt_journey_step_${sid}_draft`,
              JSON.stringify(newDados),
            );
          }
        } catch {
          localStorage.setItem(
            `lt_journey_step_${sid}_draft`,
            JSON.stringify(newDados),
          );
        }
      }, 2000);
    },
    [profile?.id, sid],
  );

  const handleComplete = async () => {
    setFinalizing(true);
    try {
      await completeJourneyStep(sid);

      if (profile?.id) {
        await supabase.from('progresso_jornada').upsert(
          {
            usuario_id: profile.id,
            passo_num: sid,
            status: 'concluido',
            dados,
            concluido_em: new Date().toISOString(),
            xp_ganho: passo?.xp ?? 100,
            atualizado_em: new Date().toISOString(),
          },
          { onConflict: 'usuario_id,passo_num' },
        );
      }

      qc.invalidateQueries({ queryKey: ['profile'] });
      setShowConfetti(true);
      toast(`Passo concluído! +${passo?.xp ?? 100} XP`, 'xp', 'star');
      setTimeout(() => nav(ROUTES.JOURNEY), 1800);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao concluir', 'error');
    } finally {
      setFinalizing(false);
    }
  };

  if (!passo) {
    return <div className="pt-6 text-center text-sm text-on-3">Passo não encontrado</div>;
  }

  if (!loaded) {
    return <div className="pt-8 text-center text-sm text-on-3">Carregando…</div>;
  }

  return (
    <>
      <Confetti active={showConfetti} />
      <JornadaShell passo={passo} onBack={() => nav(ROUTES.JOURNEY)}>
        {/* Renderiza o arquétipo correto */}
        {passo.arquetipo === 'reflexivo' && (
          <PassoReflexivo passoId={sid} dados={dados} setDados={updateDados} />
        )}
        {passo.arquetipo === 'planejador' && (
          <PassoPlanejador passoId={sid} dados={dados} setDados={updateDados} />
        )}
        {passo.arquetipo === 'operacional' && (
          <PassoOperacional passoId={sid} dados={dados} setDados={updateDados} />
        )}
        {passo.arquetipo === 'performatico' && (
          <PassoPerformatico passoId={sid} dados={dados} setDados={updateDados} />
        )}
        {passo.arquetipo === 'lideranca' && (
          <PassoLideranca passoId={sid} dados={dados} setDados={updateDados} />
        )}

        {/* CTA de conclusão */}
        <div className="mt-6">
          {!isDone ? (
            <Button
              variant="ge"
              fullWidth
              onClick={handleComplete}
              disabled={finalizing}
              leftIcon={<Icon name="check_circle" filled className="!text-[18px]" />}
            >
              {finalizing ? 'Concluíndo…' : `Concluir passo · +${passo.xp} XP`}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-card bg-em/15 py-3 text-sm font-semibold text-em">
              <Icon name="verified" filled className="!text-[18px]" />
              Passo concluído
            </div>
          )}
        </div>
      </JornadaShell>
    </>
  );
}
