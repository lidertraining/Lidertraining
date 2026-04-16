import type { ClosingLaw } from '@ltypes/content';

export const CLOSING_LAWS: ClosingLaw[] = [
  {
    name: 'Lei da Pergunta',
    description: 'Quem pergunta, conduz. Termine sempre com uma pergunta que leve ao SIM.',
    icon: 'quiz',
    example: 'Você prefere começar com o kit A ou com o kit B?',
  },
  {
    name: 'Lei da Perspectiva',
    description: 'Ajude a pessoa a enxergar o resultado futuro. Faça o sonho virar imagem.',
    icon: 'visibility',
    example: 'Imagine sua vida daqui 12 meses com essa renda extra pagando as contas.',
  },
  {
    name: 'Lei da Urgência',
    description: 'Mostre o custo de não decidir agora. Tempo é a commodity mais cara.',
    icon: 'timer',
    example: 'A promoção termina sexta-feira. Vamos garantir seu lugar hoje?',
  },
];
