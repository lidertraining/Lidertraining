import type { FIRStep } from '@ltypes/content';

/** First Introduction Reality — 8 etapas de onboarding. */
export const FIR_STEPS: FIRStep[] = [
  { id: 1, title: 'Leia o Manual do Consultor', rewardXP: 50 },
  { id: 2, title: 'Assista ao vídeo de boas-vindas', rewardXP: 50 },
  { id: 3, title: 'Monte sua lista inicial (50 nomes)', rewardXP: 100 },
  { id: 4, title: 'Faça seu primeiro pedido pessoal', rewardXP: 150 },
  { id: 5, title: 'Agende sua primeira apresentação', rewardXP: 100 },
  { id: 6, title: 'Convide 3 pessoas', rewardXP: 150 },
  { id: 7, title: 'Participe de uma reunião online', rewardXP: 50 },
  { id: 8, title: 'Complete a avaliação de scout', rewardXP: 100 },
];
