import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@lib/supabase';
import { useAuth } from '@shared/hooks/useAuth';
import { useProfile } from '@shared/hooks/useProfile';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useToast } from '@shared/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@config/routes';

export function OnboardingPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const [name, setName] = useState(profile?.name ?? '');
  const [submitting, setSubmitting] = useState(false);

  const onContinue = async () => {
    if (!session || !name.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim(), onboarded: true })
        .eq('id', session.user.id);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ['profile'] });
      toast('Tudo pronto! Vamos come\u00e7ar', 'success', 'rocket_launch');
      nav(ROUTES.FIR);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-page flex-col items-center justify-center gap-8 bg-sf-void px-6 py-12">
      <div className="text-center">
        <div className="serif mb-2 text-5xl">💎</div>
        <h1 className="serif text-3xl font-bold">Bem-vindo!</h1>
        <p className="mt-2 max-w-xs text-sm text-on-3">
          Antes de come\u00e7ar, como voc\u00ea gostaria de ser chamado?
        </p>
      </div>

      <div className="flex w-full flex-col gap-4">
        <Input
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <Button onClick={onContinue} disabled={!name.trim() || submitting} fullWidth>
          {submitting ? 'Salvando\u2026' : 'Continuar'}
        </Button>
      </div>
    </div>
  );
}
