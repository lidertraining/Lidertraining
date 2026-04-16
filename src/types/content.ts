/** Tipos do conteúdo estático (passos, objeções, scripts, áudios, etc.). */

export interface JourneyTask {
  title: string;
  detail?: string;
}

export interface JourneyScript {
  scenario: string;
  text: string;
}

export interface JourneyStep {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
  goal?: string;
  body?: string;
  tasks?: JourneyTask[];
  scripts?: JourneyScript[];
  examples?: string[];
  mistakes?: string[];
  timeMinutes?: number;
}

export interface CareerLevel {
  name: string;
  xp: number;
  color: string;
  icon: string;
  perks?: string[];
}

export interface LeagueDef {
  name: string;
  color: string;
  icon: string;
}

export interface Objection {
  objection: string;
  response: string;
  context?: string;
  followUp?: string;
}

export interface ClosingLaw {
  name: string;
  description: string;
  icon: string;
  example: string;
  tip?: string;
}

export interface ClosingScript {
  name: string;
  template: string;
  useWhen?: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  durationSeconds: number;
  url?: string;
  description?: string;
  keyPoints?: string[];
}

export interface FIRStep {
  id: number;
  title: string;
  rewardXP: number;
  body?: string;
  checklist?: string[];
  tip?: string;
}

export interface OneOnOneStep {
  step: string;
  detail?: string;
  duration?: string;
}

export interface GoldenRule {
  rule: string;
  explanation: string;
  icon: string;
}

export interface PresentationFormat {
  format: string;
  description: string;
  useWhen: string;
  durationMinutes: number;
  icon: string;
}

export interface WhatsAppTemplate {
  id: string;
  category: 'primeiro_contato' | 'convite' | 'follow_up' | 'objecao' | 'fechamento' | 'pos_venda';
  title: string;
  template: string;
  variables?: string[];
  useWhen?: string;
}
