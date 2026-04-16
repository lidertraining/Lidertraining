import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@shared/hooks/useAuth';
import { useProfile } from '@shared/hooks/useProfile';
import { Button } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { Input } from '@shared/ui/Input';
import { Avatar } from '@shared/ui/Avatar';
import { Icon } from '@shared/ui/Icon';
import { ScoutRadar } from '@shared/ui/ScoutRadar';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { supabase } from '@lib/supabase';
import { formatPhoneBR, normalizePhone } from '@lib/phone';
import { formatXP } from '@lib/format';
import { getCareerProgress, CAREER } from '@content/career';
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
  const career = getCareerProgress(profile?.xp ?? 0);
  const scout = (profile?.scout as number[]) ?? [5, 5, 5, 5, 5, 5, 5, 5, 5, 5];

  return (
    <div className="flex flex-col gap-4 pt-4">
      <h1 className="serif text-2xl font-bold">Perfil</h1>

      {/* Card principal */}
      <Card variant="surface" className="flex flex-col items-center gap-3 p-6 text-center">
        <Avatar name={profile?.name ?? '?'} size="xl" />
        <div>
          <div className="serif text-xl font-bold">{profile?.name ?? 'Consultor'}</div>
          <div className="text-xs text-on-3">{profile?.level ?? 'Master'}</div>
        </div>
        <div className="flex items-center gap-1 text-am">
          <Icon name="star" filled className="!text-[16px]" />
          <span className="text-sm font-bold">{formatXP(profile?.xp ?? 0)} XP</span>
        </div>
      </Card>

      {/* Carreira */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Icon name="military_tech" filled className="!text-[18px] text-gd" />
          <div className="flex-1 text-sm font-semibold">Carreira</div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold">{career.current.name}</span>
          {career.next && (
            <span className="text-on-3">
              Próximo: {career.next.name} ({formatXP(career.next.xp)} XP)
            </span>
          )}
        </div>
        <ProgressBar value={career.progress} fillClassName="bg-gp" />
        {career.current.perks && career.current.perks.length > 0 && (
          <ul className="flex flex-col gap-1">
            {career.current.perks.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-on-3">
                <Icon name="check_circle" filled className="mt-0.5 !text-[12px] text-em" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <StatMini icon="local_fire_department" value={profile?.streak ?? 0} label="Streak" color="or" />
        <StatMini icon="bolt" value={profile?.energy ?? 0} label="Energia" color="or" />
        <StatMini icon="groups" value={profile?.teamCount ?? 0} label="Equipe" color="am" />
      </div>

      {/* Scout Radar */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Icon name="radar" filled className="!text-[18px] text-am" />
          <div className="flex-1 text-sm font-semibold">Scout — Autoavaliação</div>
        </div>
        <ScoutRadar values={scout} />
      </Card>

      {/* Telefone */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
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

      {/* Níveis de carreira */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Icon name="emoji_events" filled className="!text-[18px] text-gd" />
          <div className="flex-1 text-sm font-semibold">Níveis de carreira</div>
        </div>
        <div className="flex flex-col gap-2">
          {CAREER.map((lv, i) => {
            const isActive = lv.name === career.current.name;
            const isReached = (profile?.xp ?? 0) >= lv.xp;
            return (
              <div
                key={i}
                className={
                  'flex items-center gap-3 rounded-card p-2 text-sm ' +
                  (isActive ? 'bg-am/10 ring-1 ring-am/40' : isReached ? 'opacity-70' : 'opacity-40')
                }
              >
                <Icon name={lv.icon} filled className="!text-[18px] text-am" />
                <div className="flex-1 font-semibold">{lv.name}</div>
                <span className="text-[11px] text-on-3">{formatXP(lv.xp)} XP</span>
                {isReached && <Icon name="check_circle" filled className="!text-[14px] text-em" />}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-2">
        <Button variant="outline" fullWidth onClick={signOut}>
          Sair da conta
        </Button>
      </div>
    </div>
  );
}

function StatMini({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  const colorClass = color === 'or' ? 'text-or' : color === 'am' ? 'text-am' : 'text-on-2';
  return (
    <Card variant="surface-sm" className="flex flex-col items-center gap-1 p-3">
      <Icon name={icon} filled className={`!text-[18px] ${colorClass}`} />
      <div className="serif text-lg font-bold">{value}</div>
      <div className="text-[9px] text-on-3">{label}</div>
    </Card>
  );
}
