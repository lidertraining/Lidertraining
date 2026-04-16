/**
 * Conquistas/badges do sistema de gamificação.
 * Cada badge tem condição verificável no lado do cliente usando Profile.
 */
export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  check: (p: BadgeContext) => boolean;
}

export interface BadgeContext {
  xp: number;
  streak: number;
  firStep: number;
  firCompleted: boolean;
  journeyStep: number;
  teamCount: number;
  contacts: number;
  sales: number;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'first-steps',
    name: 'Primeiros Passos',
    description: 'Completou o FIR (onboarding dos 7 dias)',
    icon: 'flag',
    color: 'em',
    check: (p) => p.firCompleted,
  },
  {
    id: 'streak-7',
    name: 'Fogo na Alma',
    description: 'Manteve 7 dias de streak seguidos',
    icon: 'local_fire_department',
    color: 'or',
    check: (p) => p.streak >= 7,
  },
  {
    id: 'streak-21',
    name: 'Hábito Formado',
    description: '21 dias de streak — o hábito virou rotina',
    icon: 'whatshot',
    color: 'rb',
    check: (p) => p.streak >= 21,
  },
  {
    id: 'journey-5',
    name: 'Meio Caminho',
    description: 'Completou 5 passos da Jornada',
    icon: 'route',
    color: 'gp',
    check: (p) => p.journeyStep >= 5,
  },
  {
    id: 'journey-11',
    name: 'Jornada Completa',
    description: 'Completou todos os 11 passos da Jornada',
    icon: 'military_tech',
    color: 'am',
    check: (p) => p.journeyStep >= 11,
  },
  {
    id: 'xp-1000',
    name: 'Primeiro Milhar',
    description: 'Atingiu 1.000 XP',
    icon: 'star',
    color: 'gd',
    check: (p) => p.xp >= 1000,
  },
  {
    id: 'xp-5000',
    name: 'Ouro Puro',
    description: 'Atingiu 5.000 XP — nível Ouro',
    icon: 'workspace_premium',
    color: 'gd',
    check: (p) => p.xp >= 5000,
  },
  {
    id: 'xp-20000',
    name: 'Lenda',
    description: 'Atingiu 20.000 XP — nível Elite',
    icon: 'auto_awesome',
    color: 'am',
    check: (p) => p.xp >= 20000,
  },
  {
    id: 'team-1',
    name: 'Primeiro Filhote',
    description: 'Patrocinou seu primeiro consultor',
    icon: 'group_add',
    color: 'em',
    check: (p) => p.teamCount >= 1,
  },
  {
    id: 'team-10',
    name: 'Formador de Time',
    description: 'Tem 10+ pessoas na equipe direta',
    icon: 'groups',
    color: 'gp',
    check: (p) => p.teamCount >= 10,
  },
  {
    id: 'contacts-100',
    name: 'Networker',
    description: 'Adicionou 100+ leads ao CRM',
    icon: 'contacts',
    color: 'cy',
    check: (p) => p.contacts >= 100,
  },
  {
    id: 'sales-1',
    name: 'Primeira Venda',
    description: 'Fechou a primeira venda',
    icon: 'shopping_cart',
    color: 'em',
    check: (p) => p.sales >= 1,
  },
];
