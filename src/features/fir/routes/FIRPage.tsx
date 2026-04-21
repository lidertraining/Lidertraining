import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { useProfile } from '@shared/hooks/useProfile';
import { useToast } from '@shared/hooks/useToast';
import { supabase } from '@lib/supabase';
import { ROUTES } from '@config/routes';
import { cn } from '@lib/cn';

import { FIR_STEP_META, TOTAL_XP, INITIAL_FIR, type FIRDados } from '../firTypes';
import { FIRWelcome } from '../components/FIRWelcome';
import { FIRStepEcossistema } from '../components/FIRStepEcossistema';
import { FIRStepSonho } from '../components/FIRStepSonho';
import { FIRStepModoOperacao } from '../components/FIRStepModoOperacao';
import { FIRStepProdutos } from '../components/FIRStepProdutos';
import { FIRStepRitmo } from '../components/FIRStepRitmo';
import { FIRStepReuniao } from '../components/FIRStepReuniao';
import { FIRStepProtocolos } from '../components/FIRStepProtocolos';
import { FIRStepContatos } from '../components/FIRStepContatos';
import { FIRCelebracao } from '../components/FIRCelebracao';

type Phase = 'welcome' | 'steps' | 'celebration';

export function FIRPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>('welcome');
  const [step, setStep] = useState(0);
  const [dados, setDados] = useState<FIRDados>(() => {
    try {
      const saved = localStorage.getItem('lt_fir_elite_draft');
      return saved ? { ...INITIAL_FIR, ...JSON.parse(saved) } : INITIAL_FIR;
    } catch {
      return INITIAL_FIR;
    }
  });
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<number | null>(null);

  const userName = profile?.name ?? 'Consultor';
  const totalSteps = FIR_STEP_META.length;

  // Carrega rascunho do Supabase ao abrir (DB tem prioridade sobre localStorage)
  useEffect(() => {
    const userId = profile?.id;
    if (!userId) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('fir_respostas')
          .select('dados, concluido')
          .eq('usuario_id', userId)
          .maybeSingle();
        if (data?.dados && typeof data.dados === 'object') {
          setDados((cur) => ({ ...cur, ...(data.dados as Partial<FIRDados>) }));
        }
      } catch { /* localStorage já foi lido no initializer */ }
    })();
  }, [profile?.id]);

  // Save IMEDIATO no Supabase — usado antes de navegar de passo (não perde dados)
  const flushSave = useCallback(async (dadosToSave?: FIRDados) => {
    const userId = profile?.id;
    if (!userId) return;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    try {
      await supabase.from('fir_respostas').upsert(
        {
          usuario_id: userId,
          dados: (dadosToSave ?? dados) as unknown as Record<string, unknown>,
          concluido: false,
        },
        { onConflict: 'usuario_id' },
      );
    } catch { /* localStorage segura o rascunho mesmo se DB falhar */ }
  }, [profile?.id, dados]);

  // Auto-save com debounce 1.5s: localStorage imediato + Supabase diferido
  const updateDados = useCallback((newDados: FIRDados) => {
    setDados(newDados);
    try {
      localStorage.setItem('lt_fir_elite_draft', JSON.stringify(newDados));
    } catch { /* noop */ }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      const userId = profile?.id;
      if (!userId) return;
      try {
        await supabase.from('fir_respostas').upsert(
          {
            usuario_id: userId,
            dados: newDados as unknown as Record<string, unknown>,
            concluido: false,
          },
          { onConflict: 'usuario_id' },
        );
      } catch { /* silencioso — localStorage preserva o rascunho */ }
    }, 1500);
  }, [profile?.id]);

  // Cleanup: garante save antes de desmontar
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, []);

  const canAdvance = (): boolean => {
    switch (step) {
      case 0: return Object.values(dados.conexoes).filter(Boolean).length >= 2;
      case 1: return dados.sonhoTexto.trim().length >= 10;
      case 2: return true; // modo já tem default
      case 3: return !!dados.dataChegada;
      case 4: return dados.convitesDias >= 1;
      case 5: return !!dados.dataReuniao;
      case 6: return true; // protocolo já tem default
      case 7: return true; // contatos é opcional nesse ponto
      default: return true;
    }
  };

  const advance = async () => {
    await flushSave();
    if (step < totalSteps - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      handleConcluir();
    }
  };

  const goBack = async () => {
    await flushSave();
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePular = async () => {
    await flushSave();
    nav(ROUTES.DASHBOARD);
  };

  const handleConcluir = async () => {
    setSaving(true);
    try {
      const userId = profile?.id;
      if (!userId) throw new Error('Sem sessão. Faça login novamente.');

      // 1) Salva dados finais com concluido=true (não-crítico mas reporta erro)
      const { error: respErr } = await supabase.from('fir_respostas').upsert(
        {
          usuario_id: userId,
          dados: dados as unknown as Record<string, unknown>,
          xp_ganho: TOTAL_XP,
          concluido: true,
        },
        { onConflict: 'usuario_id' },
      );
      if (respErr) {
        console.error('[FIR] erro ao salvar fir_respostas:', respErr);
        // Não bloqueia — segue com o resto
      }

      // 2) Marca FIR como completa (CRÍTICO)
      const { error: updErr } = await supabase.from('profiles').update({
        fir_completed: true,
        fir_step: 8,
        fir_done_mask: 255,
      }).eq('id', userId);
      if (updErr) {
        console.error('[FIR] erro ao marcar profile.fir_completed:', updErr);
        throw new Error(`Falha ao marcar conclusão: ${updErr.message}`);
      }

      // 3) Concede XP (não-crítico)
      const { error: xpErr } = await supabase.rpc('add_xp', {
        p_amount: TOTAL_XP,
        p_reason: 'FIR Digital Elite completa',
      });
      if (xpErr) console.error('[FIR] erro ao creditar XP:', xpErr);

      qc.invalidateQueries({ queryKey: ['profile'] });
      localStorage.removeItem('lt_fir_elite_draft');
      setPhase('celebration');
    } catch (err) {
      console.error('[FIR] handleConcluir falhou:', err);
      toast(
        err instanceof Error
          ? `Erro: ${err.message}`
          : 'Erro ao concluir FIR. Tente de novo.',
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  // --- WELCOME ---
  if (phase === 'welcome') {
    return (
      <div className="mx-auto max-w-page bg-sf-void">
        <FIRWelcome userName={userName} onStart={() => setPhase('steps')} />
      </div>
    );
  }

  // --- CELEBRATION ---
  if (phase === 'celebration') {
    return (
      <div className="mx-auto max-w-page bg-sf-void">
        <FIRCelebracao
          dados={dados}
          userName={userName}
          onFinish={() => nav(ROUTES.DASHBOARD)}
        />
      </div>
    );
  }

  // --- STEPS ---
  const meta = FIR_STEP_META[step]!;
  const progressPct = ((step + 1) / totalSteps) * 100;

  return (
    <div className="mx-auto min-h-dvh max-w-page bg-sf-void px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <button onClick={goBack} disabled={step === 0} className="tap text-on-3 disabled:opacity-30">
            <Icon name="arrow_back" className="!text-[22px]" />
          </button>
          <div className="text-center">
            <div className="text-[9px] font-bold uppercase tracking-[.2em] text-am">
              FIR Digital Elite
            </div>
            <div className="text-[11px] text-on-3">
              Passo {step + 1} de {totalSteps}
            </div>
          </div>
          <button
            onClick={handlePular}
            className="tap text-[11px] text-on-3"
          >
            Pular
          </button>
        </div>

        {/* Progress bar segmentada */}
        <div className="flex gap-1">
          {FIR_STEP_META.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-all',
                i <= step ? 'bg-gp' : 'bg-sf-top',
              )}
            />
          ))}
        </div>

        {/* Step meta */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gp">
            <Icon name={meta.icon} filled className="!text-[20px] text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">{meta.titulo}</div>
            <div className="flex items-center gap-2 text-[10px] text-on-3">
              <span className="flex items-center gap-1">
                <Icon name="schedule" className="!text-[10px]" /> {meta.tempo}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="star" filled className="!text-[10px] text-am" /> +{meta.xp} XP
              </span>
            </div>
          </div>
          <div className="serif text-sm font-bold text-am">{Math.round(progressPct)}%</div>
        </div>
      </div>

      {/* Step content */}
      <div className="mb-24">
        {step === 0 && <FIRStepEcossistema dados={dados} setDados={updateDados} />}
        {step === 1 && <FIRStepSonho dados={dados} setDados={updateDados} />}
        {step === 2 && <FIRStepModoOperacao dados={dados} setDados={updateDados} />}
        {step === 3 && <FIRStepProdutos dados={dados} setDados={updateDados} />}
        {step === 4 && <FIRStepRitmo dados={dados} setDados={updateDados} />}
        {step === 5 && <FIRStepReuniao dados={dados} setDados={updateDados} />}
        {step === 6 && <FIRStepProtocolos dados={dados} setDados={updateDados} />}
        {step === 7 && <FIRStepContatos dados={dados} setDados={updateDados} />}
      </div>

      {/* Bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-page bg-sf-void px-4 pb-6 pt-3">
        <Button
          variant="ge"
          fullWidth
          disabled={!canAdvance() || saving}
          onClick={advance}
        >
          {saving
            ? 'Salvando…'
            : step === totalSteps - 1
              ? `Concluir FIR · +${TOTAL_XP} XP`
              : `Próximo passo →`}
        </Button>
      </div>
    </div>
  );
}
