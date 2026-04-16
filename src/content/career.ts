import type { CareerLevel } from '@ltypes/content';

/** Níveis de carreira, XP threshold, visual e benefícios por nível. */
export const CAREER: CareerLevel[] = [
  {
    name: 'Master',
    xp: 0,
    color: 'on-3',
    icon: 'workspace_premium',
    perks: [
      'Acesso ao FIR (onboarding dos 7 dias)',
      'Biblioteca básica de scripts e objeções',
      'Reconhecimento em mural de novos iniciantes',
    ],
  },
  {
    name: 'Prata',
    xp: 2000,
    color: 'on-2',
    icon: 'workspace_premium',
    perks: [
      'Acesso a templates WhatsApp exclusivos',
      '1x1 quinzenal com líder do time',
      'Menção em reunião mensal do time',
      'Pin digital de Prata no perfil',
    ],
  },
  {
    name: 'Ouro',
    xp: 5000,
    color: 'gd',
    icon: 'workspace_premium',
    perks: [
      '1x1 semanal com upline',
      'Indicação preferencial pro Top 10 semanal',
      'Acesso à live mensal "Mentoria Ouro"',
      'Bônus de reconhecimento trimestral',
    ],
  },
  {
    name: 'Diamante',
    xp: 10000,
    color: 'dia',
    icon: 'diamond',
    perks: [
      'Acesso ao grupo Diamante (WhatsApp restrito)',
      'Convite pra eventos presenciais da liderança',
      'Mentoria direta com Top da empresa',
      'Publicação obrigatória em destaque no feed',
      'Camisa/pin físico de Diamante',
    ],
  },
  {
    name: 'Elite',
    xp: 20000,
    color: 'am',
    icon: 'military_tech',
    perks: [
      'Participação em decisões estratégicas da empresa',
      'Convite vitalício pra convenções anuais',
      'Reconhecimento como "mentor" da plataforma',
      'Badge Elite permanente no perfil',
      'Viagem de premiação anual',
    ],
  },
];

/** Retorna nível atual e próximo dado o XP. */
export function getCareerProgress(xp: number) {
  let current = CAREER[0]!;
  let next: CareerLevel | null = null;

  for (let i = 0; i < CAREER.length; i++) {
    const level = CAREER[i]!;
    if (xp >= level.xp) {
      current = level;
      next = CAREER[i + 1] ?? null;
    }
  }

  const progress = next ? ((xp - current.xp) / (next.xp - current.xp)) * 100 : 100;

  return { current, next, progress: Math.max(0, Math.min(100, progress)) };
}
