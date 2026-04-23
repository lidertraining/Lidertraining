import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@shared/hooks/useAuth';
import {
  createLead,
  deleteLead,
  listLeads,
  updateLead,
  bulkCreateLeads,
  listExistingPhones,
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

// ============================================================
// BULK IMPORT (novos)
// ============================================================

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
        toast('Nenhum lead novo importado', 'info', 'contacts');
        return;
      }
      const totalXp = result.inserted * 15;
      // XP agregado: UMA chamada só com o total, não uma por contato
      addXP({ amount: totalXp, reason: `${result.inserted} novos leads` });
      toast(
        `${result.inserted} leads importados · +${totalXp} XP 🎉`,
        'xp',
        'celebration',
      );
      if (result.failed > 0) {
        setTimeout(() => {
          toast(`${result.failed} não salvaram (duplicatas?)`, 'info', 'info');
        }, 400);
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
