import { useState } from 'react';
import type { Lead, LeadStatus } from '@ltypes/domain';
import { Modal } from '@shared/ui/Modal';
import { Button } from '@shared/ui/Button';
import { Select } from '@shared/ui/Select';
import { Input } from '@shared/ui/Input';
import { Textarea } from '@shared/ui/Textarea';
import { Icon } from '@shared/ui/Icon';
import { useDeleteLead, useUpdateLead } from '../hooks/useLeads';

interface LeadModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export function LeadModal({ lead, onClose }: LeadModalProps) {
  const { mutateAsync: update, isPending: updating } = useUpdateLead();
  const { mutateAsync: remove, isPending: deleting } = useDeleteLead();
  const [status, setStatus] = useState<LeadStatus>(lead?.status ?? 'frio');
  const [step, setStep] = useState(lead?.step ?? 'Novo contato');
  const [notes, setNotes] = useState(lead?.notes ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!lead) return null;

  const save = async () => {
    await update({
      id: lead.id,
      input: { status, step, notes },
    });
    onClose();
  };

  const onDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await remove(lead.id);
    onClose();
  };

  return (
    <Modal open={!!lead} onClose={onClose} title={lead.name} maxWidth="380px">
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
            Status
          </span>
          <Select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>
            <option value="frio">Frio</option>
            <option value="morno">Morno</option>
            <option value="quente">Quente</option>
            <option value="fechado">Fechado · +50 XP</option>
          </Select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
            Etapa
          </span>
          <Input value={step} onChange={(e) => setStep(e.target.value)} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-on-3">
            Anotações
          </span>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Contexto, próximos passos, objeções levantadas…"
          />
        </label>

        <div className="flex gap-2">
          <Button variant="surface" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button variant="gp" onClick={save} disabled={updating} className="flex-1">
            {updating ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>

        <button
          onClick={onDelete}
          disabled={deleting}
          className="tap mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-rb"
        >
          <Icon name="delete" className="!text-[14px]" />
          {confirmDelete ? (deleting ? 'Removendo…' : 'Confirmar remoção') : 'Remover lead'}
        </button>
      </div>
    </Modal>
  );
}
