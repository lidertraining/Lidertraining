import { useState } from 'react';
import { Icon } from '@shared/ui/Icon';
import { Card } from '@shared/ui/Card';
import { Button } from '@shared/ui/Button';
import { useToast } from '@shared/hooks/useToast';
import { useProfile } from '@shared/hooks/useProfile';
import { supabase } from '@lib/supabase';
import { buildWaURL } from '@lib/phone';
import { cn } from '@lib/cn';

interface MemberActionsRowProps {
  memberId?: string;
  memberName: string;
  memberPhone?: string | null;
}

const ACTIONS = [
  { id: 'wa', icon: 'chat', label: 'WhatsApp', color: 'em' as const },
  { id: '1x1', icon: 'event', label: '1x1', color: 'am' as const },
  { id: 'reminder', icon: 'alarm', label: 'Lembrete', color: 'or' as const },
  { id: 'recog', icon: 'celebration', label: 'Reconhecer', color: 'gd' as const },
];

const COLOR_CLASS: Record<string, string> = {
  em: 'bg-em/15 text-em',
  am: 'bg-am-darker/30 text-am',
  or: 'bg-or/15 text-or',
  gd: 'bg-gd/15 text-gd',
};

const RECOGNITION_PRESETS = [
  { icon: 'trending_up', label: 'Progresso incrível esta semana!' },
  { icon: 'local_fire_department', label: 'Streak mantido — você é imparável!' },
  { icon: 'groups', label: 'Liderança de excelência formando o time!' },
  { icon: 'emoji_events', label: 'Resultado top, continue assim!' },
  { icon: 'favorite', label: 'Admiro sua consistência e dedicação!' },
];

export function MemberActionsRow({ memberId, memberName, memberPhone }: MemberActionsRowProps) {
  const { toast } = useToast();
  const { data: me } = useProfile();
  const [recogOpen, setRecogOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const onClick = async (id: string) => {
    if (id === 'wa') {
      if (memberPhone) {
        window.open(buildWaURL(memberPhone, `Oi ${memberName.split(' ')[0]}!`), '_blank');
      } else {
        toast('Este membro não tem telefone cadastrado', 'info');
      }
      return;
    }

    if (id === '1x1') {
      if (memberPhone) {
        const msg = `Oi ${memberName.split(' ')[0]}! Bora marcar nosso 1x1 dessa semana? Tenho terça 20h e quinta 19h — qual fica melhor?`;
        window.open(buildWaURL(memberPhone, msg), '_blank');
      } else {
        toast('Adicione telefone do membro para agendar pelo WhatsApp', 'info');
      }
      return;
    }

    if (id === 'reminder') {
      if (memberPhone) {
        const msg = `Oi ${memberName.split(' ')[0]}! Passando pra lembrar da meta que a gente combinou. Como você tá?`;
        window.open(buildWaURL(memberPhone, msg), '_blank');
      } else {
        toast('Membro sem telefone', 'info');
      }
      return;
    }

    if (id === 'recog') {
      setRecogOpen(true);
      return;
    }
  };

  const sendRecognition = async (message: string) => {
    if (!memberId || !me) {
      toast('Não foi possível reconhecer', 'error');
      return;
    }
    setSending(true);
    try {
      // Insere notificação pro membro
      await supabase.from('notifications').insert({
        user_id: memberId,
        type: 'team',
        message: `${me.name} te reconheceu: "${message}"`,
        icon: 'celebration',
      });

      // Feed event do reconhecedor (visível pra downline)
      await supabase.from('feed_events').insert({
        user_id: me.id,
        actor_name: me.name,
        action: `reconheceu ${memberName}: "${message}"`,
        icon: 'celebration',
        visibility: 'self_and_downline',
      });

      toast(`${memberName.split(' ')[0]} foi reconhecido(a)!`, 'success', 'celebration');
      setRecogOpen(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao reconhecer', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-1.5">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => onClick(a.id)}
            className={cn(
              'tap flex flex-col items-center gap-1 rounded-card-sm p-2 text-[10px] font-semibold',
              COLOR_CLASS[a.color],
            )}
          >
            <Icon name={a.icon} filled className="!text-[16px]" />
            {a.label}
          </button>
        ))}
      </div>

      {recogOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ov/60 px-6">
          <Card variant="surface" className="w-full max-w-sm animate-fade-up p-5" glow="gd">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Icon name="celebration" filled className="!text-[20px] text-gd" />
                <div className="flex-1 serif text-base font-bold">
                  Reconhecer {memberName.split(' ')[0]}
                </div>
                <button onClick={() => setRecogOpen(false)} className="text-on-3">
                  <Icon name="close" className="!text-[18px]" />
                </button>
              </div>
              <p className="text-[11px] text-on-3">
                Envie uma mensagem de reconhecimento. Vai aparecer como notificação pra
                ele(a) e no feed da sua downline.
              </p>
              <div className="flex flex-col gap-2">
                {RECOGNITION_PRESETS.map((r, i) => (
                  <Button
                    key={i}
                    variant="surface"
                    fullWidth
                    disabled={sending}
                    onClick={() => sendRecognition(r.label)}
                    leftIcon={<Icon name={r.icon} filled className="!text-[16px] text-gd" />}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
