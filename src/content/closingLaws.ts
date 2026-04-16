import type { ClosingLaw } from '@ltypes/content';

export const CLOSING_LAWS: ClosingLaw[] = [
  {
    name: 'Lei da Pergunta',
    description:
      'Quem pergunta, conduz. Termine sempre com uma pergunta que leve ao SIM. Pergunta aberta gera divagação; pergunta binária conduz à decisão.',
    icon: 'quiz',
    example: 'Você prefere começar com o kit Start ou o kit Pro?',
    tip: 'Nunca pergunte "e aí, o que achou?" no fechamento — respostas evasivas vêm fáceis. Troque por escolhas fechadas: "hoje ou amanhã?", "kit A ou kit B?".',
  },
  {
    name: 'Lei da Perspectiva',
    description:
      'Ajude a pessoa a enxergar o resultado futuro. Faça o sonho virar imagem. Emoção move; lógica apenas justifica.',
    icon: 'visibility',
    example:
      'Imagina você daqui 12 meses. Mesma rotina, mesma renda — ou: essa renda extra rodando e pagando a escola dos seus filhos sem aperto. Qual dos dois você escolhe hoje?',
    tip: 'Use verbos no presente ao descrever o futuro ("você acorda", "você recebe") — o cérebro processa como já estivesse acontecendo.',
  },
  {
    name: 'Lei da Urgência',
    description:
      'Mostre o custo de não decidir agora. Tempo é a commodity mais cara. Sem urgência, o lead adia eternamente.',
    icon: 'timer',
    example:
      'Essa turma de onboarding fecha sexta-feira — depois a próxima só daqui 30 dias. Faz mais sentido a gente começar juntos agora ou perder o mês?',
    tip: 'Urgência tem que ser real. Mentira sobre escassez queima a confiança pra sempre — e a pessoa descobre.',
  },
];
