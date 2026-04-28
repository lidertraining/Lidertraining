import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@shared/hooks/useAuth';
import {
  createLead,
  deleteLead,
  listLeads,
  listArchivedLeads,
  updateLead,
  bulkCreateLeads,
  listExistingPhones,
  archiveLeads,
  unarchiveLeads,
  logWhatsAppAttempt,
} from '../api/leads';
import type { CreateLeadInput, UpdateLeadInput } from '../schemas';
import { useAddXP } from '@features/gamification/hooks/useAddXP';
import { useToast } from '@shared/hooks/useToast';
import type { ProcessedContact } from '@lib/contacts-import';

export function useLeads() {
  const { session } = useAuth();
  const uid = session?.user.id;
  return useQuery({
    queryKey: ['leads', uid],
    enabled: !!uid,
    queryFn: () => (uid ? listLeads(uid) : Promise.resolve([])),
  });
}

export function useArchivedLeads() {
  const { session } = useAuth();
  const uid = session?.user.id;
  return useQuery({
    queryKey: ['leads-archived', uid],
    enabled: !!uid,
    queryFn: () => (uid ? listArchivedLeads(uid) : Promise.resolve([])),
  });
}

export function useCreateLead() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { mutate: addXP } = useAddXP();
  const { toast } = useToast();
  const uid = session?.user.id;
  return useMutation({
    mutationFn: async (input: CreateLeadInput) => {
      if (!uid) throw new Error('Sem sessão');
      return createLead(uid, input);
    },
    onSuccess: (lead) => {
      qc.invalidateQueries({ queryKey: ['leads', uid] });
      addXP({ amount: 15, reason: `Novo lead: ${lead.name}` });
      toast('Lead adicionado', 'success', 'person_add');
    },
    onError: (err) => {
      toast(err instanceof Error ? err.message : 'Erro ao adicionar', 'error');
    },
  });
}

export function useUpdateLead() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { mutate: addXP } = useAddXP();
  const { toast } = useToast();
  const uid = session?.user.id;
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLeadInput }) => updateLead(id, input),
    onSuccess: (lead, { input }) => {
      qc.invalidateQueries({ queryKey: ['leads', uid] });
      if (input.status === 'fechado') addXP({ amount: 50, reason: `Fechou: ${lead.name}` });
      else toast('Lead atualizado', 'success', 'check');
    },
    onError: (err) => {
      toast(err instanceof Error ? err.message : 'Erro ao atualizar', 'error');
    },
  });
}

export function useDeleteLead() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const uid = session?.user.id;
  return useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads', uid] });
      toast('Lead removido', 'info', 'delete');
    },
    onError: (err) => {
      toast(err instanceof Error ? err.message : 'Erro ao remover', 'error');
    },
  });
}

export function useArchiveLeads() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const uid = session?.user.id;
  return useMutation({
    mutationFn: archiveLeads,
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['leads', uid] });
      qc.invalidateQueries({ queryKey: ['leads-archived', uid] });
      toast(`${count} lead${count === 1 ? '' : 's'} arquivado${count === 1 ? '' : 's'}`, 'info', 'archive');
    },
    onError: (err) => {
      toast(err instanceof Error ? err.message : 'Erro ao arquivar', 'error');
    },
  });
}

export function useUnarchiveLeads() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const uid = session?.user.id;
  return useMutation({
    mutationFn: unarchiveLeads,
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['leads', uid] });
      qc.invalidateQueries({ queryKey: ['leads-archived', uid] });
      toast(`${count} lead${count === 1 ? '' : 's'} restaurado${count === 1 ? '' : 's'}`, 'success', 'unarchive');
    },
    onError: (err) => {
      toast(err instanceof Error ? err.message : 'Erro ao restaurar', 'error');
    },
  });
}

export function useLogWhatsAppAttempt() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const uid = session?.user.id;
  return useMutation({
    mutationFn: ({
      leadId,
      phone,
      result = 'opened',
    }: {
      leadId: string;
      phone: string;
      result?: 'opened' | 'invalid' | 'unknown';
    }) => {
      if (!uid) throw new Error('Sem sessão');
      return logWhatsAppAttempt(uid, leadId, phone, result);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads', uid] });
    },
  });
}

export interface BulkImportArgs {
  contacts: ProcessedContact[];
  source: string;
}

export function useBulkCreateLeads() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const { mutate: addXP } = useAddXP();
  const { toast } = useToast();
  const uid = session?.user.id;

  return useMutation({
    mutationFn: async ({ contacts, source }: BulkImportArgs) => {
      if (!uid) throw new Error('Sem sessão');
      return bulkCreateLeads(uid, contacts, source);
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['leads', uid] });
      qc.invalidateQueries({ queryKey: ['leads-phones', uid] });
      if (result.inserted === 0) {
        if (result.failed === 0) {
          toast('Todos já estavam na sua lista', 'info', 'contacts');
        } else {
          toast(`${result.failed} contatos não foram salvos`, 'info', 'info');
        }
        return;
      }
      const totalXp = result.inserted * 15;
      addXP({ amount: totalXp, reason: `${result.inserted} novos leads` });
      toast(
        `${result.inserted} leads importados · +${totalXp} XP 🎉`,
        'xp',
        'celebration',
      );
      const familia = result.leads.filter((l) => l.category === 'familia').length;
      const profis = result.leads.filter((l) => l.category === 'profissional').length;
      const conhec = result.leads.filter((l) => l.category === 'conhecido').length;
      if (familia + profis + conhec > 0) {
        setTimeout(() => {
          const partes: string[] = [];
          if (familia > 0) partes.push(`❤️ ${familia} família`);
          if (profis > 0) partes.push(`💼 ${profis} profissionais`);
          if (conhec > 0) partes.push(`👋 ${conhec} conhecidos`);
          toast(`Detectei: ${partes.join(' · ')}`, 'info', 'auto_awesome');
        }, 800);
      }
      if (result.failed > 0) {
        setTimeout(() => {
          toast(`${result.failed} não salvaram (duplicatas)`, 'info', 'info');
        }, 1600);
      }
    },
    onError: (err) => {
      toast(err instanceof Error ? err.message : 'Erro na importação', 'error');
    },
  });
}

export function useExistingPhones() {
  const { session } = useAuth();
  const uid = session?.user.id;
  return useQuery({
    queryKey: ['leads-phones', uid],
    enabled: !!uid,
    queryFn: () => (uid ? listExistingPhones(uid) : Promise.resolve(new Set<string>())),
  });
}
