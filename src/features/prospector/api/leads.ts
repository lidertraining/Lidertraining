import { supabase } from '@lib/supabase';
import type { Lead, LeadStatus } from '@types/domain';
import type { CreateLeadInput, UpdateLeadInput } from '../schemas';

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapLead(row: any): Lead {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    phone: row.phone,
    status: row.status as LeadStatus,
    source: row.source,
    score: row.score,
    step: row.step,
    lastContact: row.last_contact,
    notes: row.notes,
    convertedAt: row.converted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function scoreFromStatus(status: LeadStatus): number {
  switch (status) {
    case 'quente':
      return 80;
    case 'morno':
      return 55;
    case 'frio':
      return 30;
    case 'fechado':
      return 100;
  }
}

export async function listLeads(userId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapLead);
}

export async function createLead(userId: string, input: CreateLeadInput): Promise<Lead> {
  const status = input.status ?? 'frio';
  const { data, error } = await supabase
    .from('leads')
    .insert({
      user_id: userId,
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      status,
      source: input.source?.trim() || 'Lista quente',
      score: scoreFromStatus(status),
      step: 'Novo contato',
    })
    .select('*')
    .single();
  if (error) throw error;
  return mapLead(data);
}

export async function updateLead(id: string, input: UpdateLeadInput): Promise<Lead> {
  const payload: Record<string, unknown> = {};
  if (input.status) {
    payload.status = input.status;
    payload.score = scoreFromStatus(input.status);
    if (input.status === 'fechado') payload.converted_at = new Date().toISOString();
  }
  if (input.step !== undefined) payload.step = input.step;
  if (input.notes !== undefined) payload.notes = input.notes;

  const { data, error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapLead(data);
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw error;
}
