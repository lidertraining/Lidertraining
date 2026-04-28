import { supabase } from '@lib/supabase';
import type {
  Lead,
  LeadStatus,
  LeadCategory,
  LeadTemperatura,
  LeadWhatsAppStatus,
} from '@ltypes/domain';
import type { CreateLeadInput, UpdateLeadInput } from '../schemas';
import type { ProcessedContact } from '@lib/contacts-import';

function mapLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    phone: (row.phone as string | null) ?? null,
    status: row.status as LeadStatus,
    source: row.source as string,
    score: row.score as number,
    step: (row.step as string | null) ?? null,
    lastContact: (row.last_contact as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    convertedAt: (row.converted_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    email: (row.email as string | null) ?? null,
    organization: (row.organization as string | null) ?? null,
    title: (row.title as string | null) ?? null,
    birthday: (row.birthday as string | null) ?? null,
    avatarUrl: (row.avatar_url as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    category: (row.category as LeadCategory | null) ?? null,
    temperatura: (row.temperatura as LeadTemperatura | null) ?? null,
    whatsappStatus: (row.whatsapp_status as LeadWhatsAppStatus | null) ?? null,
    scoreIcp: (row.score_icp as number | null) ?? null,
    classificationTags: (row.classification_tags as string[] | null) ?? [],
    classificationEvidencias:
      (row.classification_evidencias as Array<Record<string, unknown>> | null) ?? [],
    classificationConfidence: (row.classification_confidence as number | null) ?? null,
    archivedAt: (row.archived_at as string | null) ?? null,
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
    .is('archived_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapLead);
}

export async function listArchivedLeads(userId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', userId)
    .not('archived_at', 'is', null)
    .order('archived_at', { ascending: false });
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

export async function archiveLeads(leadIds: string[]): Promise<number> {
  if (leadIds.length === 0) return 0;
  const { data, error } = await supabase
    .from('leads')
    .update({ archived_at: new Date().toISOString() })
    .in('id', leadIds)
    .select('id');
  if (error) throw error;
  return data?.length ?? 0;
}

export async function unarchiveLeads(leadIds: string[]): Promise<number> {
  if (leadIds.length === 0) return 0;
  const { data, error } = await supabase
    .from('leads')
    .update({ archived_at: null })
    .in('id', leadIds)
    .select('id');
  if (error) throw error;
  return data?.length ?? 0;
}

export async function logWhatsAppAttempt(
  userId: string,
  leadId: string,
  phone: string,
  result: 'opened' | 'invalid' | 'unknown' = 'opened',
): Promise<void> {
  await supabase.from('lead_whatsapp_attempts').insert({
    user_id: userId,
    lead_id: leadId,
    phone,
    result,
  });
  if (result === 'opened') {
    await supabase
      .from('leads')
      .update({ whatsapp_status: 'ativo' })
      .eq('id', leadId)
      .eq('whatsapp_status', 'desconhecido');
  } else if (result === 'invalid') {
    await supabase.from('leads').update({ whatsapp_status: 'inativo' }).eq('id', leadId);
  }
}

export interface BulkCreateResult {
  inserted: number;
  failed: number;
  leads: Lead[];
}

export async function bulkCreateLeads(
  userId: string,
  contacts: ProcessedContact[],
  source: string,
): Promise<BulkCreateResult> {
  if (contacts.length === 0) return { inserted: 0, failed: 0, leads: [] };

  const CHUNK = 500;
  const inserted: Lead[] = [];
  let failed = 0;
  let lastError: { message?: string; code?: string; details?: string } | null = null;

  const rows = contacts.map((c) => ({
    user_id: userId,
    name: c.name,
    phone: c.phone,
    status: 'frio' as LeadStatus,
    source,
    score: 30,
    step: 'Novo contato',
    email: c.email ?? null,
    organization: c.organization ?? null,
    title: c.title ?? null,
    birthday: c.birthday ?? null,
    avatar_url: c.avatarUrl ?? null,
    metadata: c.metadata ?? {},
    ...(c.category ? { category: c.category } : {}),
    ...(c.temperatura ? { temperatura: c.temperatura } : {}),
    ...(c.classificationTags && c.classificationTags.length > 0
      ? { classification_tags: c.classificationTags }
      : {}),
    ...(c.classificationEvidencias && c.classificationEvidencias.length > 0
      ? { classification_evidencias: c.classificationEvidencias }
      : {}),
    ...(c.classificationConfidence !== undefined
      ? { classification_confidence: c.classificationConfidence }
      : {}),
  }));

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from('leads')
      .upsert(chunk, {
        onConflict: 'user_id,phone',
        ignoreDuplicates: true,
      })
      .select('*');
    if (error) {
      failed += chunk.length;
      lastError = error;
      console.error('[bulkCreateLeads] chunk failed', error, { chunkSize: chunk.length });
      continue;
    }
    const mapped = (data ?? []).map(mapLead);
    inserted.push(...mapped);
  }

  if (inserted.length === 0 && failed > 0 && lastError) {
    const msg = lastError.message ?? 'Erro desconhecido ao inserir leads';
    const code = lastError.code ? ` [${lastError.code}]` : '';
    throw new Error(`${msg}${code}`);
  }

  return { inserted: inserted.length, failed, leads: inserted };
}

export async function listExistingPhones(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('leads')
    .select('phone')
    .eq('user_id', userId)
    .not('phone', 'is', null);
  if (error) throw error;
  const set = new Set<string>();
  for (const row of data ?? []) {
    const p = (row as { phone: string | null }).phone;
    if (p) set.add(p);
  }
  return set;
}
