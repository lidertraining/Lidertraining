import { supabase } from '@lib/supabase';
import { STEPS } from '@content/steps';
import { OBJECTIONS } from '@content/objections';
import { ICEBREAKERS } from '@content/icebreakers';
import { CLOSING_LAWS } from '@content/closingLaws';
import { CLOSING_SCRIPTS } from '@content/closingScripts';
import type { JourneyStep, Objection, ClosingLaw, ClosingScript } from '@types/content';

/**
 * Carrega os passos da jornada do Supabase.
 * Em caso de falha (p.ex. tabela ainda sem seed), retorna o fallback local.
 */
export async function listJourneySteps(): Promise<JourneyStep[]> {
  const { data, error } = await supabase
    .from('journey_steps')
    .select('id, name, icon, color, description')
    .order('id');
  if (error || !data || data.length === 0) return STEPS;
  return data as JourneyStep[];
}

export async function listObjections(): Promise<Objection[]> {
  const { data, error } = await supabase
    .from('objections')
    .select('objection, response')
    .order('order_idx');
  if (error || !data || data.length === 0) return OBJECTIONS;
  return data as Objection[];
}

export async function listIcebreakers(): Promise<string[]> {
  const { data, error } = await supabase.from('icebreakers').select('text').order('order_idx');
  if (error || !data || data.length === 0) return ICEBREAKERS;
  return data.map((r) => r.text);
}

export async function listClosingLaws(): Promise<ClosingLaw[]> {
  const { data, error } = await supabase
    .from('closing_laws')
    .select('name, description, icon, example')
    .order('order_idx');
  if (error || !data || data.length === 0) return CLOSING_LAWS;
  return data as ClosingLaw[];
}

export async function listClosingScripts(): Promise<ClosingScript[]> {
  const { data, error } = await supabase
    .from('closing_scripts')
    .select('name, template')
    .order('order_idx');
  if (error || !data || data.length === 0) return CLOSING_SCRIPTS;
  return data as ClosingScript[];
}

export async function getStepNotes(stepId: number): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return '';
  const { data, error } = await supabase
    .from('step_notes')
    .select('content')
    .eq('user_id', user.id)
    .eq('step_id', stepId)
    .maybeSingle();
  if (error || !data) return '';
  return data.content ?? '';
}

export async function saveStepNotes(stepId: number, content: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Sem sess\u00e3o');
  const { error } = await supabase
    .from('step_notes')
    .upsert({ user_id: user.id, step_id: stepId, content }, { onConflict: 'user_id,step_id' });
  if (error) throw error;
}

export async function completeJourneyStep(stepId: number) {
  const { data, error } = await supabase.rpc('complete_journey_step', { p_step: stepId });
  if (error) throw error;
  return data;
}
