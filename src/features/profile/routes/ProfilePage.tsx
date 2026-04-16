import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@shared/hooks/useAuth';
import { useProfile } from '@shared/hooks/useProfile';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Avatar } from '@shared/ui/Avatar';
import { Icon } from '@shared/ui/Icon';
import { supabase } from '@lib/supabase';
import { formatPhoneBR, normalizePhone } from '@lib/phone';
import { useToast } from '@shared/hooks/useToast';

export function ProfilePage() {
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.phone) setPhone(formatPhoneBR(profile.phone));
  }, [profile?.phone]);

  const savePhone = async () => {
    const digits = normalizePhone(phone);
    if (digits.length < 10) {
      toast('Telefone inválido (DDD + número)', 'error');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: digits })
        .eq('id', profile!.id);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ['profile'] });
      toast('Telefone salvo', 'success', 'check_circle');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const phoneChanged = normalizePhone(phone) !== (profile?.phone ?? '');

  return (
    <div className="pt-4">
      <h1 className="serif mb-4 text-2xl font-bold">Perfil</h1>

      <Card variant="surface" className="flex flex-col items-center gap-3 p-6 text-center">
        <Avatar name={profile?.name ?? '?'} size="xl" />
        <div>
          <div className="serif text-xl font-bold">{profile?.name ?? 'Consultor'}</div>
          <div className="text-xs text-on-3">{profile?.level ?? 'Master'}</div>
        </div>
      </Card>

      <Card variant="surface-sm" className="mt-4 flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Icon name="chat" filled className="!text-[18px] text-em" />
          <div className="flex-1">
            <div className="text-sm font-semibold">WhatsApp</div>
            <div className="text-[11px] text-on-3">
              Seu upline usa esse número para falar com você.
            </div>
          </div>
        </div>
        <Input
          type="tel"
          placeholder="(11) 98765-4321"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button variant="ge" fullWidth disabled={saving || !phoneChanged} onClick={savePhone}>
          {saving ? 'Salvando…' : 'Salvar telefone'}
        </Button>
      </Card>

      <div className="mt-6">
        <Button variant="outline" fullWidth onClick={signOut}>
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
