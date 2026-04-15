import type { Profile } from '@types/domain';
import { ROUTES, buildRoute } from '@config/routes';

export interface NBA {
  title: string;
  description: string;
  cta: string;
  icon: string;
  href: string;
  variant: 'gp' | 'gg' | 'ge' | 'gr';
}

/**
 * Next Best Action \u2014 sugere a a\u00e7\u00e3o de maior impacto dado o estado atual.
 * Prioridade: FIR \u2192 streak em risco \u2192 passo atual da jornada \u2192 prospec\u00e7\u00e3o.
 */
export function useNBA(profile: Profile | null | undefined): NBA | null {
  if (!profile) return null;

  if (!profile.firCompleted && profile.firStep < 8) {
    return {
      title: 'Complete seu FIR',
      description: `Faltam ${8 - profile.firStep} etapa(s) do primeiro passo.`,
      cta: 'Continuar FIR',
      icon: 'auto_awesome',
      href: ROUTES.FIR,
      variant: 'gp',
    };
  }

  if (profile.streak === 0) {
    return {
      title: 'Reinicie seu streak',
      description: 'Adicione 1 lead hoje para come\u00e7ar uma nova sequ\u00eancia.',
      cta: 'Prospectar',
      icon: 'local_fire_department',
      href: ROUTES.PROSPECTOR,
      variant: 'gr',
    };
  }

  if (profile.contacts === 0) {
    return {
      title: 'Adicione seu primeiro lead',
      description: 'Organize seus contatos para acompanhar o follow-up.',
      cta: 'Abrir Prospector',
      icon: 'person_add',
      href: ROUTES.PROSPECTOR,
      variant: 'gp',
    };
  }

  if (profile.journeyStep < 10) {
    return {
      title: `Pr\u00f3ximo passo da Jornada`,
      description: `Continue o programa onde voc\u00ea parou.`,
      cta: 'Ir para a jornada',
      icon: 'route',
      href: buildRoute.journeyStep(profile.journeyStep),
      variant: 'gp',
    };
  }

  return {
    title: 'Duplique seu processo',
    description: 'Convide um novo consultor e ensine o que aprendeu.',
    cta: 'Gerenciar equipe',
    icon: 'group_add',
    href: ROUTES.LEADER,
    variant: 'ge',
  };
}
