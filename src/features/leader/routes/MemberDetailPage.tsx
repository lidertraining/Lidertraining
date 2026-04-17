import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTeamLearning } from '../hooks/useTeamLearning';
import { useJourneySteps } from '@features/journey/hooks/useJourneyContent';
import { BackButton } from '@shared/layout/BackButton';
import { Card } from '@shared/ui/Card';
import { Avatar } from '@shared/ui/Avatar';
import { Icon } from '@shared/ui/Icon';
import { Button } from '@shared/ui/Button';
import { ProgressBar } from '@shared/ui/ProgressBar';
import { EmptyState } from '@shared/ui/EmptyState';
import { PageSpinner } from '@shared/ui/PageSpinner';
import { ActivityDot } from '../components/ActivityDot';
import { MemberActionsRow } from '../components/MemberActionsRow';
import { FIR_STEPS } from '@content/firSteps';
import { formatXP } from '@lib/format';
import { buildWaURL, formatPhoneBR } from '@lib/phone';
import { cn } from '@lib/cn';
import { useToast } from '@shared/hooks/useToast';
import {
  getDownlineInviteCode,
  buildInviteURL,
  buildWhatsAppShareURL,
} from '../api/invites';
import { useProfile } from '@shared/hooks/useProfile';

export function MemberDetailPage() {
  const { id = '' } = useParams();
  const { data: team = [], isLoading } = useTeamLearning(6);
  const { data: steps = [] } = useJourneySteps();
  const { data: me } = useProfile();
  const { toast } = useToast();

  const member = useMemo(() => team.find((m) => m.id === id), [team, id]);

  if (isLoading) return <PageSpinner />;

  if (!member) {
    return (
      <div className="flex flex-col gap-4 pt-2">
        <BackButton to="/leader" label="Líder" />
        <EmptyState
          icon="person_off"
          title="Membro não encontrado"
          description="Esse consultor não está na sua downline."
        />
      </div>
    );
  }

  const journeyPct = Math.round((member.journeyStep / 10) * 100);
  const firPct = member.firCompleted ? 100 : Math.round((member.firStep / 8) * 100);
  const audiosPct =
    member.audiosTotal > 0
      ? Math.round((member.audiosDone / member.audiosTotal) * 100)
      : 0;

  const currentStep = steps.find((s) => s.id === member.journeyStep);
  const nextFir = FIR_STEPS.find((s) => s.id === member.firStep + 1);

  const shareWhatsApp = async () => {
    try {
      const code = await getDownlineInviteCode(member.id);
      const url = buildWhatsAppShareURL(code, me?.name ?? 'Seu patrocinador');
      window.open(url, '_blank');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao gerar link', 'error');
    }
  };

  const copyLink = async () => {
    try {
      const code = await getDownlineInviteCode(member.id);
      await navigator.clipboard.writeText(buildInviteURL(code));
      toast('Link copiado', 'success', 'content_copy');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao copiar', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-5 pt-2">
      <BackButton to="/leader" label="Equipe" />

      {/* Hero */}
      <Card variant="surface" className="flex flex-col items-center gap-3 p-5" glow="am">
        <Avatar name={member.name} size="xl" />
        <div className="text-center">
          <h1 className="serif text-2xl font-bold">{member.name}</h1>
          <div className="mt-1 flex items-center justify-center gap-2 text-xs text-on-3">
            <span>{member.level}</span>
            <span>·</span>
            <span className="text-am font-semibold">{formatXP(member.xp)} XP</span>
            {member.depth > 1 && (
              <>
                <span>·</span>
                <span>Nível {member.depth}</span>
              </>
            )}
          </div>
          <ActivityDot daysSinceActive={member.daysSinceActive} className="mt-2 justify-center" />
        </div>
      </Card>

      {/* CTA WhatsApp direto */}
      {member.phone && (
        <a
          href={buildWaURL(
            member.phone,
            `Oi ${member.name.split(' ')[0]}! Tudo bem? Queria falar com você sobre a sua jornada.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="tap flex items-center justify-between rounded-card bg-em/15 px-4 py-3 text-em hover:bg-em/25"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-em/30">
              <Icon name="chat" filled className="!text-[20px]" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                Falar com {member.name.split(' ')[0]} no WhatsApp
              </div>
              <div className="text-[11px] opacity-80">{formatPhoneBR(member.phone)}</div>
            </div>
          </div>
          <Icon name="chevron_right" className="!text-[18px]" />
        </a>
      )}

      {/* Ações */}
      <MemberActionsRow memberId={member.id} memberName={member.name} memberPhone={member.phone} />

      {/* Convidar em nome dele */}
      <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Icon name="forward_to_inbox" filled className="!text-[18px] text-am" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Convidar em nome de {member.name.split(' ')[0]}</div>
            <div className="text-[11px] text-on-3">
              Novo cadastro vai direto para a equipe dele — não para a sua.
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ge" size="sm" fullWidth onClick={shareWhatsApp}
            leftIcon={<Icon name="chat" filled className="!text-[16px]" />}>
            WhatsApp
          </Button>
          <Button variant="surface" size="sm" fullWidth onClick={copyLink}
            leftIcon={<Icon name="content_copy" className="!text-[16px]" />}>
            Copiar link
          </Button>
        </div>
      </Card>

      {/* Jornada */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="serif text-lg font-bold">Jornada</h2>
          <span className="text-xs font-semibold text-am">{journeyPct}%</span>
        </div>
        <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gp">
              <Icon
                name={currentStep?.icon ?? 'route'}
                filled
                className="!text-[22px] text-white"
              />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
                Passo atual
              </div>
              <div className="serif text-base font-bold">
                {currentStep ? `${member.journeyStep + 1}. ${currentStep.name}` : 'Não iniciou'}
              </div>
            </div>
          </div>
          <ProgressBar value={journeyPct} fillClassName="bg-gp" />
          <div className="text-[11px] text-on-3">
            {member.journeyStep} de 10 passos concluídos
          </div>
        </Card>
      </section>

      {/* FIR */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="serif text-lg font-bold">FIR — Primeiros Passos</h2>
          <span className="text-xs font-semibold text-gd">{firPct}%</span>
        </div>
        <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
          {member.firCompleted ? (
            <div className="flex items-center gap-2 text-em">
              <Icon name="verified" filled className="!text-[20px]" />
              <span className="text-sm font-semibold">FIR concluído!</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gg">
                  <Icon name="flag" filled className="!text-[22px] text-sf-void" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
                    Próxima etapa
                  </div>
                  <div className="serif text-base font-bold">
                    {nextFir?.title ?? 'Não iniciou'}
                  </div>
                </div>
              </div>
              <ProgressBar value={firPct} fillClassName="bg-gg" />
              <div className="text-[11px] text-on-3">
                {member.firStep} de 8 etapas concluídas
              </div>
            </>
          )}
        </Card>
      </section>

      {/* Áudios */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="serif text-lg font-bold">Áudios</h2>
          <span className="text-xs font-semibold text-cy">{audiosPct}%</span>
        </div>
        <Card variant="surface-sm" className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cy/20">
              <Icon name="headphones" filled className="!text-[22px] text-cy" />
            </div>
            <div className="flex-1">
              <div className="serif text-base font-bold">
                {member.audiosDone} de {member.audiosTotal || 8}
              </div>
              <div className="text-[11px] text-on-3">áudios ouvidos</div>
            </div>
          </div>
          <ProgressBar value={audiosPct} fillClassName="bg-cy" />
        </Card>
      </section>

      {/* Notas e leads */}
      <section className="grid grid-cols-2 gap-2">
        <MetricCard
          icon="edit_note"
          value={member.notesWritten}
          label="Notas escritas"
          color="am"
        />
        <MetricCard
          icon="person_add"
          value={member.leadsCount}
          label="Leads no CRM"
          color="or"
        />
        <MetricCard
          icon="local_fire_department"
          value={member.streak}
          label="Dias de streak"
          color="or"
        />
        <MetricCard
          icon="star"
          value={member.weeklyXP}
          label="XP desta semana"
          color="am"
        />
      </section>
    </div>
  );
}

interface MetricCardProps {
  icon: string;
  value: number;
  label: string;
  color: 'am' | 'or' | 'cy' | 'gd' | 'em';
}

function MetricCard({ icon, value, label, color }: MetricCardProps) {
  const colors: Record<string, string> = {
    am: 'text-am',
    or: 'text-or',
    cy: 'text-cy',
    gd: 'text-gd',
    em: 'text-em',
  };
  return (
    <Card variant="surface-sm" className="flex flex-col gap-1 p-3">
      <Icon name={icon} filled className={cn('!text-[16px]', colors[color])} />
      <div className="serif text-xl font-bold">{formatXP(value)}</div>
      <div className="text-[10px] text-on-3">{label}</div>
    </Card>
  );
}
