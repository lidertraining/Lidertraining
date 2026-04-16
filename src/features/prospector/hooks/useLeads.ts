import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@shared/hooks/useAuth';
import { createLead, deleteLead, listLeads, updateLead } from '../api/leads';
import type { CreateLeadInput, UpdateLeadInput } from '../schemas';
import { useAddXP } from '@features/gamification/hooks/useAddXP';
import { useToast } from '@shared/hooks/useToast';

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
      if (input.status === 'fechado') {
        addXP({ amount: 50, reason: `Fechou: ${lead.name}` });
      } else {
        toast('Lead atualizado', 'success', 'check');
      }
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
