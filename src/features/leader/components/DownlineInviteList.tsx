import { useState } from 'react';
import type { TeamLearningMember } from '../api/teamLearning';
import { Card } from '@shared/ui/Card';
import { Avatar } from '@shared/ui/Avatar';
import { Icon } from '@shared/ui/Icon';
import { Modal } from '@shared/ui/Modal';
import { InviteShareButtons } from './InviteShareButtons';
import { getDownlineInviteCode } from '../api/invites';
import { useToast } from '@shared/hooks/useToast';
import { EmptyState } from '@shared/ui/EmptyState';

interface DownlineInviteListProps {
  members: TeamLearningMember[];
  inviterName: string;
}

/**
 * Lista os consultores diretos com botão "Gerar convite em nome dele".
 * Útil para o líder ajudar consultor júnior a recrutar — o novo cadastro
 * vincula ao consultor escolhido, não ao líder.
 */
export function DownlineInviteList({ members, inviterName }: DownlineInviteListProps) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<TeamLearningMember | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const direct = members.filter((m) => m.depth === 1);

  const handleSelect = async (member: TeamLearningMember) => {
    setSelected(member);
    setLoading(true);
    try {
      const c = await getDownlineInviteCode(member.id);
      setCode(c);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro', 'error');
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  if (direct.length === 0) {
    return (
      <EmptyState
        icon="group_add"
        title="Sem consultores diretos"
        description="Quando você tiver sua equipe formada, poderá compartilhar convites em nome deles aqui."
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
          Compartilhar em nome de um consultor
        </h3>
        <p className="text-xs text-on-3">
          Útil quando você quer apresentar a plataforma para alguém, mas o novo
          cadastro deve ir para a equipe de um consultor seu (não sua).
        </p>
        {direct.map((m) => (
          <Card
            key={m.id}
            variant="surface-sm"
            className="tap flex items-center gap-3 p-3 hover-glow"
            onClick={() => handleSelect(m)}
          >
            <Avatar name={m.name} size="sm" />
            <div className="flex-1">
              <div className="text-sm font-semibold">{m.name}</div>
              <div className="text-[10px] text-on-3">{m.level}</div>
            </div>
            <Icon name="forward_to_inbox" filled className="!text-[18px] text-am" />
          </Card>
        ))}
      </div>

      <Modal
        open={!!selected}
        onClose={() => {
          setSelected(null);
          setCode(null);
        }}
        title={selected ? `Convite em nome de ${selected.name.split(' ')[0]}` : ''}
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-on-3">
            O código abaixo é o código pessoal de{' '}
            <strong className="text-on">{selected?.name}</strong>. Quem usar esse
            link vai direto para a equipe dele.
          </p>
          {loading || !code ? (
            <div className="text-center text-sm text-on-3">Gerando código…</div>
          ) : (
            <>
              <Card variant="surface" className="p-4 text-center" glow="am">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
                  Código
                </div>
                <div className="serif mt-1 text-3xl font-bold tracking-[0.2em] text-am">
                  {code}
                </div>
              </Card>
              <InviteShareButtons code={code} inviterName={inviterName} />
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
