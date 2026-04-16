import type { OneOnOneStep } from '@ltypes/content';

/**
 * Roteiro do 1x1 semanal (upline ↔ líder direto).
 * 8 blocos, ~45 minutos total. Mesmo roteiro toda semana — a repetição
 * é o segredo da duplicação.
 */
export const ONE_ON_ONE_DETAIL: OneOnOneStep[] = [
  {
    step: 'Quebra-gelo e rapport',
    detail:
      'Abertura humana. Pergunta sobre a semana, a família, algo pessoal. Não pule direto pros números — a conversa precisa de camada emocional antes.',
    duration: '3 min',
  },
  {
    step: 'Celebrar vitórias da semana',
    detail:
      'O que deu certo? Pode ser uma venda, uma apresentação boa, um feedback positivo, um desafio vencido. Registrar e comemorar amplifica o que funciona.',
    duration: '5 min',
  },
  {
    step: 'Revisar os números',
    detail:
      'Contatos feitos, apresentações marcadas, apresentações realizadas, fechamentos, pedidos, pontuação. Sem julgamento — só fotografia da realidade.',
    duration: '10 min',
  },
  {
    step: 'Analisar pipeline de leads',
    detail:
      'Lead a lead: quem tá quente, quem tá esfriando, quem precisa de follow-up. Decide próxima ação de cada um antes de sair da call.',
    duration: '8 min',
  },
  {
    step: 'Um ensino / ferramenta nova',
    detail:
      'Escolha 1 tema da semana (objeção, script, técnica). 8 minutos de conteúdo concreto. Não tente ensinar tudo — 1 coisa aplicada vale mais que 10 escutadas.',
    duration: '8 min',
  },
  {
    step: 'Plano de ação da semana',
    detail:
      'Quantas abordagens, quantas apresentações, quantos fechamentos — meta clara pra cada indicador. Escrito, não na cabeça.',
    duration: '5 min',
  },
  {
    step: 'Compromissos por escrito',
    detail:
      'Fecha a call com 3 compromissos específicos. "Vou fazer X até sexta." Envie depois no WhatsApp pra ter registro.',
    duration: '3 min',
  },
  {
    step: 'Encerramento motivador',
    detail:
      'Reforço positivo curto. Lembrar o porquê. Um "tô contigo, vai dar certo" sincero. O líder sai com energia, não com planilha.',
    duration: '3 min',
  },
];

/** Versão legada (strings) mantida pra compat com UI antiga. */
export const ONE_ON_ONE_PLAN: string[] = ONE_ON_ONE_DETAIL.map((s) => s.step);
