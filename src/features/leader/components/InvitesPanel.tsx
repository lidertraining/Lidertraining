import { useMyPersonalCode } from '../hooks/useInvites';
import { useTeamLearning } from '../hooks/useTeamLearning';
import { useProfile } from '@shared/hooks/useProfile';
import { Card } from '@shared/ui/Card';
import { Icon } from '@shared/ui/Icon';
import { PageSpinner } from '@shared/ui/PageSpinner';
import { InviteShareButtons } from './InviteShareButtons';
import { DownlineInviteList } from './DownlineInviteList';

/**
 * Aba de convites do Líder.
 * Mostra código pessoal permanente + opção de compartilhar em nome de downline.
 */
export function InvitesPanel() {
  const { data: code, isLoading } = useMyPersonalCode();
  const { data: team = [] } = useTeamLearning(6);
  const { data: profile } = useProfile();

  if (isLoading) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-6">
      {/* Código pessoal do consultor */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="serif text-lg font-bold">Seu código pessoal</h2>
          <p className="text-xs text-on-3">
            Esse código é único e permanente. Quem usar ele no cadastro entra
            direto na sua equipe.
          </p>
        </div>

        <Card variant="surface" className="flex flex-col gap-4 p-5" glow="am">
          <div className="flex flex-col items-center gap-2 text-center">
            <Icon name="qr_code_2" filled className="!text-[28px] text-am" />
            <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
              Código permanente
            </div>
            <div className="serif text-4xl font-bold tracking-[0.25em] text-am">
              {code ?? '—'}
            </div>
            <div className="text-[11px] text-on-3">
              lidertraining.vercel.app/signup/{code ?? '…'}
            </div>
          </div>

          {code && profile && (
            <InviteShareButtons code={code} inviterName={profile.name} />
          )}
        </Card>
      </section>

      {/* Compartilhar em nome de downline */}
      <section className="flex flex-col gap-3">
        <DownlineInviteList
          members={team}
          inviterName={profile?.name ?? 'Seu patrocinador'}
        />
      </section>
    </div>
  );
}
