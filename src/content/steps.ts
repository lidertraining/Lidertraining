import type { JourneyStep } from '@ltypes/content';

/**
 * Fallback dos 11 passos da jornada (migrado do HTML original).
 * A fonte de verdade em produção é a tabela public.journey_steps.
 */
export const STEPS: JourneyStep[] = [
  { id: 0, name: 'Defina seu Sonho', icon: 'favorite', color: 'am', description: 'Por que você está aqui?' },
  { id: 1, name: 'Monte sua Lista', icon: 'list', color: 'am', description: 'Pessoas que você conhece' },
  { id: 2, name: 'Sua História', icon: 'auto_stories', color: 'am', description: 'Conecte com emoção' },
  { id: 3, name: 'Vire Produto', icon: 'spa', color: 'am', description: 'Use o que vende' },
  { id: 4, name: 'Aprenda a Contar', icon: 'psychology', color: 'am', description: 'Storytelling de impacto' },
  { id: 5, name: 'Prospecção', icon: 'person_search', color: 'am', description: 'Como abordar' },
  { id: 6, name: 'Convite', icon: 'mail', color: 'am', description: 'Chame para conhecer' },
  { id: 7, name: 'Apresentação', icon: 'co_present', color: 'am', description: '4 formas de mostrar' },
  { id: 8, name: 'Fechamento', icon: 'handshake', color: 'gd', description: 'As 3 Leis' },
  { id: 9, name: 'Acompanhamento', icon: 'schedule', color: 'em', description: 'Follow-up eficiente' },
  { id: 10, name: 'Duplicação', icon: 'group_add', color: 'em', description: 'Ensine quem entrou' },
];
