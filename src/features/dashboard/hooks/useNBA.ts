import type { Profile } from '@ltypes/domain';
import { ROUTES, buildRoute } from '@config/routes';

export interface NBA {
  title: string;
  description: string;
  cta: string;
  icon: string;
  href: string;
  variant: 'gp' | 'gg' | 'ge' | 'gr';
  xpReward?: number;
}

/**
 * Next Best Action — sugere a ação de maior impacto dado o estado atual.
 * Retorna as 3 melhores ações ordenadas por prioridade.
 */
export function useNBA(profile: Profile | null | undefined): NBA[] {
  if (!profile) return [];

  const actions: NBA[] = [];

  // 1. FIR incompleto — prioridade máxima
  if (!profile.firCompleted && profile.firStep < 8) {
    actions.push({
      title: 'Continue o FIR',
      description: `Faltam ${8 - profile.firStep} etapa(s) pra completar o onboarding. Cada uma rende XP.`,
      cta: 'Continuar FIR',
      icon: 'flag',
      href: ROUTES.FIR,
      variant: 'gp',
      xpReward: 50,
    });
  }

  // 2. Streak em risco
  if (profile.streak === 0) {
    actions.push({
      title: 'Inicie seu streak',
      description: 'Faça qualquer ação hoje pra não zerar. 1 lead, 1 áudio, 1 passo.',
      cta: 'Prospectar agora',
      icon: 'local_fire_department',
      href: ROUTES.PROSPECTOR,
      variant: 'gr',
    });
  } else if (profile.streak > 0 && profile.streak < 7) {
    actions.push({
      title: `Streak de ${profile.streak} dias`,
      description: `Faltam ${7 - profile.streak} dia(s) pra conquistar o badge "Fogo na Alma".`,
      cta: 'Manter streak',
      icon: 'local_fire_department',
      href: ROUTES.PROSPECTOR,
      variant: 'gg',
    });
  }

  // 3. Zero leads
  if (profile.contacts === 0) {
    actions.push({
      title: 'Monte sua lista',
      description: 'Importe contatos do celular ou adicione manualmente. Mínimo: 50 nomes.',
      cta: 'Abrir Prospector',
      icon: 'person_add',
      href: ROUTES.PROSPECTOR,
      variant: 'gp',
      xpReward: 15,
    });
  }

  // 4. Poucos leads (< 50)
  if (profile.contacts > 0 && profile.contacts < 50) {
    actions.push({
      title: `${profile.contacts} de 50 leads`,
      description: 'Sua lista precisa de pelo menos 50 nomes. Importe contatos do WhatsApp.',
      cta: 'Adicionar leads',
      icon: 'group_add',
      href: ROUTES.PROSPECTOR,
      variant: 'gp',
    });
  }

  // 5. Próximo passo da Jornada
  if (profile.journeyStep <= 10) {
    actions.push({
      title: `Passo ${profile.journeyStep + 1} da Jornada`,
      description: 'Continue o programa de formação onde parou.',
      cta: 'Ir para o passo',
      icon: 'route',
      href: buildRoute.journeyStep(profile.journeyStep),
      variant: 'gp',
      xpReward: 100,
    });
  }

  // 6. Nenhuma venda
  if (profile.sales === 0 && profile.contacts >= 10) {
    actions.push({
      title: 'Feche sua primeira venda',
      description: 'Você tem leads no CRM. Escolha um quente e convide pra apresentação.',
      cta: 'Ver leads quentes',
      icon: 'shopping_cart',
      href: ROUTES.PROSPECTOR,
      variant: 'ge',
    });
  }

  // 7. Equipe vazia
  if (profile.teamCount === 0 && profile.firCompleted) {
    actions.push({
      title: 'Convide seu primeiro consultor',
      description: 'Compartilhe seu link de convite e forme sua equipe.',
      cta: 'Convidar',
      icon: 'diversity_3',
      href: ROUTES.LEADER,
      variant: 'ge',
    });
  }

  // 8. Duplicação — se tiver equipe
  if (profile.teamCount >= 1) {
    actions.push({
      title: 'Acompanhe sua equipe',
      description: `Você tem ${profile.teamCount} pessoa(s). Faça o 1x1 semanal.`,
      cta: 'Ver equipe',
      icon: 'groups',
      href: ROUTES.LEADER,
      variant: 'ge',
    });
  }

  // 9. Ouvir áudios da academia
  actions.push({
    title: 'Ouça um áudio',
    description: 'Escolha um áudio da Academia e ganhe +25 XP por cada ouvido.',
    cta: 'Academia',
    icon: 'headphones',
    href: ROUTES.ACADEMY,
    variant: 'gp',
    xpReward: 25,
  });

  return actions.slice(0, 3);
}
