/**
 * Tipos de domínio do LiderTraining.
 */

export type UserLevel = 'Master' | 'Prata' | 'Ouro' | 'Diamante' | 'Elite';
export type League = 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
export type LeadStatus = 'frio' | 'morno' | 'quente' | 'fechado';
export type TeamStatus = 'ativo' | 'inativo' | 'risco';
export type MissionType = 'flash' | 'weekly' | 'achievement';
export type NotifType = 'streak' | 'mission' | 'league' | 'team' | 'nba' | 'info' | 'xp';

export type LeadCategory =
  | 'familia'
  | 'amigo_proximo'
  | 'conhecido'
  | 'profissional'
  | 'desconhecido';

export type LeadTemperatura = 'quente' | 'morno' | 'frio';
export type LeadWhatsAppStatus = 'ativo' | 'inativo' | 'desconhecido';

export interface Profile {
  id: string;
  uplineId: string | null;
  name: string;
  phone: string | null;
  dataNascimento: string | null;
  avatarUrl: string | null;
  xp: number;
  level: UserLevel;
  streak: number;
  lastActive: string | null;
  streakFreezeActive: boolean;
  freezes: number;
  energy: number;
  maxEnergy: number;
  league: League;
  weeklyXP: number;
  journeyStep: number;
  journeyDoneMask: number;
  firCompleted: boolean;
  firStep: number;
  firDoneMask: number;
  onboarded: boolean;
  contacts: number;
  sales: number;
  teamCount: number;
  pg: number;
  pp: number;
  vip: number;
  commCurrent: number;
  commProjected: number;
  commGoal: number;
  scout: number[];
  role: 'consultant' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  userId: string;
  name: string;
  phone: string | null;
  status: LeadStatus;
  source: string;
  score: number;
  step: string | null;
  lastContact: string | null;
  notes: string | null;
  convertedAt: string | null;
  createdAt: string;
  updatedAt: string;
  email: string | null;
  organization: string | null;
  title: string | null;
  birthday: string | null;
  avatarUrl: string | null;
  metadata: Record<string, unknown>;
  category: LeadCategory | null;
  temperatura: LeadTemperatura | null;
  whatsappStatus: LeadWhatsAppStatus | null;
  scoreIcp: number | null;
  classificationTags: string[];
  classificationEvidencias: Array<Record<string, unknown>>;
  classificationConfidence: number | null;
  archivedAt: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  xp: number;
  journeyStep: number;
  streak: number;
  status: TeamStatus;
  vip: number;
  firCompleted: boolean;
  audiosDone: number;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  type: MissionType;
  target: number;
  rewardXP: number;
  durationSeconds: number | null;
  requirements: Record<string, unknown> | null;
}

export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  progress: number;
  completedAt: string | null;
  expiresAt: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotifType;
  message: string;
  icon: string | null;
  read: boolean;
  createdAt: string;
}

export interface FeedEvent {
  id: string;
  userId: string;
  actorName: string;
  action: string;
  icon: string;
  createdAt: string;
}

export interface InviteCode {
  code: string;
  ownerId: string;
  maxUses: number;
  uses: number;
  expiresAt: string | null;
  createdAt: string;
}
