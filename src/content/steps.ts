import type { JourneyStep } from '@ltypes/content';

/**
 * Fallback dos 11 passos da jornada (migrado do HTML original).
 * A fonte de verdade em produ\u00e7\u00e3o \u00e9 a tabela public.journey_steps.
 */
export const STEPS: JourneyStep[] = [
  { id: 0, name: 'Defina seu Sonho', icon: 'favorite', color: 'am', description: 'Por que voc\u00ea est\u00e1 aqui?' },
  { id: 1, name: 'Monte sua Lista', icon: 'list', color: 'am', description: 'Pessoas que voc\u00ea conhece' },
  { id: 2, name: 'Sua Hist\u00f3ria', icon: 'auto_stories', color: 'am', description: 'Conecte com emo\u00e7\u00e3o' },
  { id: 3, name: 'Vire Produto', icon: 'spa', color: 'am', description: 'Use o que vende' },
  { id: 4, name: 'Aprenda a Contar', icon: 'psychology', color: 'am', description: 'Storytelling de impacto' },
  { id: 5, name: 'Prospec\u00e7\u00e3o', icon: 'person_search', color: 'am', description: 'Como abordar' },
  { id: 6, name: 'Convite', icon: 'mail', color: 'am', description: 'Chame para conhecer' },
  { id: 7, name: 'Apresenta\u00e7\u00e3o', icon: 'co_present', color: 'am', description: '4 formas de mostrar' },
  { id: 8, name: 'Fechamento', icon: 'handshake', color: 'gd', description: 'As 3 Leis' },
  { id: 9, name: 'Acompanhamento', icon: 'schedule', color: 'em', description: 'Follow-up eficiente' },
  { id: 10, name: 'Duplica\u00e7\u00e3o', icon: 'group_add', color: 'em', description: 'Ensine quem entrou' },
];
