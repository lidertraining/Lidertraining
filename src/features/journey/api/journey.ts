import { supabase } from '@lib/supabase';
import { unescapeRow, unescapeUnicode } from '@lib/unescape';
import { STEPS } from '@content/steps';
import { OBJECTIONS } from '@content/objections';
import { ICEBREAKERS } from '@content/icebreakers';
import { CLOSING_LAWS } from '@content/closingLaws';
import { CLOSING_SCRIPTS } from '@content/closingScripts';
import type { JourneyStep, Objection, ClosingLaw, ClosingScript } from '@ltypes/content';

/**
 * Carrega os passos da jornada do Supabase.
 *
 * Estratégia: o DB armazena os campos editáveis (name, icon, color, description);
 * os campos "ricos" (goal, body, tasks, scripts, examples, mistakes, timeMinutes)
 * vivem só no código em src/content/steps.ts. Aqui fazemos o merge: DB vence
 * para os 5 campos canônicos; local entrega o conteúdo didático rico.
 *
 * Se o DB estiver vazio ou falhar, usa totalmente o fallback local.
 */
export async function listJourneySteps(): Promise<JourneyStep[]> {
  const { data, error } = await supabase
    .from('journey_steps')
    .select('id, name, icon, color, description')
    .order('id');

  if (error || !data || data.length === 0) return STEPS;

  const localById = new Map(STEPS.map((s) => [s.id, s]));

  return data.map((row) => {
    const base = unescapeRow(row as JourneyStep);
    const rich = localById.get(base.id);
    if (!rich) return base;
    // DB vence para campos canônicos; conteúdo rico vem do local
    return {
      ...rich,
      ...base,
      goal: rich.goal,
      body: rich.body,
      tasks: rich.tasks,
      scripts: rich.scripts,
      examples: rich.examples,
      mistakes: rich.mistakes,
      timeMinutes: rich.timeMinutes,
    };
  });
}

export async function listObjections(): Promise<Objection[]> {
  const { data, error } = await supabase
    .from('objections')
    .select('objection, response')
    .order('order_idx');
  if (error || !data || data.length === 0) return OBJECTIONS;
  return (data as Objection[]).map((r) => unescapeRow(r));
}

export async function listIcebreakers(): Promise<string[]> {
  const { data, error } = await supabase.from('icebreakers').select('text').order('order_idx');
  if (error || !data || data.length === 0) return ICEBREAKERS;
  return data.map((r) => unescapeUnicode(r.text));
}

export async function listClosingLaws(): Promise<ClosingLaw[]> {
  const { data, error } = await supabase
    .from('closing_laws')
    .select('name, description, icon, example')
    .order('order_idx');
  if (error || !data || data.length === 0) return CLOSING_LAWS;
  return (data as ClosingLaw[]).map((r) => unescapeRow(r));
}

export async function listClosingScripts(): Promise<ClosingScript[]> {
  const { data, error } = await supabase
    .from('closing_scripts')
    .select('name, template')
    .order('order_idx');
  if (error || !data || data.length === 0) return CLOSING_SCRIPTS;
  return (data as ClosingScript[]).map((r) => unescapeRow(r));
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
  if (!user) throw new Error('Sem sessão');
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
