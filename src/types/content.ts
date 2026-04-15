/** Tipos do conte\u00fado est\u00e1tico (passos, objeções, scripts, \u00e1udios, etc.). */

export interface JourneyStep {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface CareerLevel {
  name: string;
  xp: number;
  color: string;
  icon: string;
}

export interface LeagueDef {
  name: string;
  color: string;
  icon: string;
}

export interface Objection {
  objection: string;
  response: string;
}

export interface ClosingLaw {
  name: string;
  description: string;
  icon: string;
  example: string;
}

export interface ClosingScript {
  name: string;
  template: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  durationSeconds: number;
  url?: string;
}

export interface FIRStep {
  id: number;
  title: string;
  rewardXP: number;
}

export interface OneOnOneStep {
  step: string;
}
