/**
 * Tipos de domínio do LiderTraining.
 * Espelha o shape do state "S" do HTML original, tipado.
 */

export type UserLevel = 'Master' | 'Prata' | 'Ouro' | 'Diamante' | 'Elite';
export type League = 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
export type LeadStatus = 'frio' | 'morno' | 'quente' | 'fechado';
export type TeamStatus = 'ativo' | 'inativo' | 'risco';
export type MissionType = 'flash' | 'weekly' | 'achievement';
export type NotifType = 'streak' | 'mission' | 'league' | 'team' | 'nba' | 'info' | 'xp';

export interface Profile {
  id: string;
  uplineId: string | null;
  name: string;
  avatarUrl: string | null;
  // gamification
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
  // progress
  journeyStep: number;
  firCompleted: boolean;
  firStep: number;
  onboarded: boolean;
  // business metrics
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
