/**
 * Pílulas diárias de conhecimento — microlearning de 30 segundos.
 * O app sorteia 1 por dia (baseado no dayOfYear). Cada uma vale +20 XP.
 */
export interface DailyPill {
  id: string;
  title: string;
  body: string;
  icon: string;
  source?: string;
}

export const DAILY_PILLS: DailyPill[] = [
  {
    id: 'dp-1',
    title: 'As 3 Leis do Fechamento',
    body: 'Pergunta conduz, perspectiva motiva, urgência fecha. Nunca termine afirmando — termine perguntando.',
    icon: 'gavel',
    source: 'Passo 9 — Fechamento',
  },
  {
    id: 'dp-2',
    title: 'A Regra dos 80/20',
    body: '80% das vendas acontecem entre o 5º e o 12º contato. Não desista no segundo "não".',
    icon: 'trending_up',
    source: 'Passo 10 — Acompanhamento',
  },
  {
    id: 'dp-3',
    title: 'Seja Produto do Produto',
    body: 'Você não pode vender o que não usa. Documente sua experiência — fotos, vídeos, resultados.',
    icon: 'spa',
    source: 'Passo 4 — Vire Produto',
  },
  {
    id: 'dp-4',
    title: 'Convite ≠ Venda',
    body: 'O convite é a venda da apresentação, não do negócio. Objetivo: marcar horário em 3 minutos.',
    icon: 'mail',
    source: 'Passo 7 — Convite',
  },
  {
    id: 'dp-5',
    title: 'A Fórmula dos 3 Atos',
    body: 'Antes (20s): como era. Encontro (30s): como conheceu. Depois (40s): o que mudou. 90 segundos.',
    icon: 'auto_stories',
    source: 'Passo 3 — Sua História',
  },
  {
    id: 'dp-6',
    title: 'Não Pré-Qualifique',
    body: 'Você não tem bola de cristal. O "impossível" pode virar seu melhor diamante. Anota e decide depois.',
    icon: 'list',
    source: 'Passo 2 — Monte sua Lista',
  },
  {
    id: 'dp-7',
    title: 'Silêncio no Fechamento',
    body: 'Depois de fazer a pergunta de fechamento, cale a boca. Quem fala primeiro perde.',
    icon: 'volume_off',
    source: 'Passo 9 — Fechamento',
  },
  {
    id: 'dp-8',
    title: 'Método Sinto-Senti-Percebi',
    body: '"Entendo como você se sente. Eu me senti igual. O que percebi foi..." Transforma objeção em empatia.',
    icon: 'psychology',
    source: 'Objeções',
  },
  {
    id: 'dp-9',
    title: 'Funil da Prospecção',
    body: '100 abordagens → 50 ouvem → 20 apresentações → 8 fecham → 3 ficam ativos. Ama a matemática.',
    icon: 'filter_alt',
    source: 'Passo 6 — Prospecção',
  },
  {
    id: 'dp-10',
    title: 'A Pergunta Ativa',
    body: 'A cada 5 minutos na apresentação, pare e pergunte: "Até aqui fez sentido?" Monólogo perde venda.',
    icon: 'question_answer',
    source: 'Passo 8 — Apresentação',
  },
  {
    id: 'dp-11',
    title: 'Duplicação > Perfeição',
    body: 'Se não pode ser duplicado por qualquer pessoa, não serve. Mantenha simples.',
    icon: 'content_copy',
    source: 'Passo 11 — Duplicação',
  },
  {
    id: 'dp-12',
    title: 'O Porquê Sustenta',
    body: 'Seu sonho precisa ter 3 níveis: racional, emocional e de identidade. Sem o terceiro, você desiste.',
    icon: 'favorite',
    source: 'Passo 1 — Defina seu Sonho',
  },
  {
    id: 'dp-13',
    title: 'Storytelling AIDA',
    body: 'Atenção → Interesse → Desejo → Ação. Toda história de venda segue essa estrutura.',
    icon: 'movie',
    source: 'Passo 5 — Aprenda a Contar',
  },
  {
    id: 'dp-14',
    title: 'Cadência dos 7 Contatos',
    body: 'Dia 0: material. Dia 1: dúvida. Dia 3: valor. Dia 7: decisão. Dia 14: novo ângulo. Dia 30: reconexão.',
    icon: 'schedule',
    source: 'Passo 10 — Acompanhamento',
  },
  {
    id: 'dp-15',
    title: 'Os 3 Perfis da Equipe',
    body: 'Builders (10%) constroem. Sellers (30%) vendem. Users (60%) consomem. Foque 70% do tempo nos builders.',
    icon: 'diversity_3',
    source: 'Passo 11 — Duplicação',
  },
  {
    id: 'dp-16',
    title: 'Áudio > Texto',
    body: 'Convites por áudio convertem 3x mais que texto. O tom transmite entusiasmo que mensagem escrita não transmite.',
    icon: 'mic',
    source: 'Passo 7 — Convite',
  },
  {
    id: 'dp-17',
    title: 'Números Específicos Vendem',
    body: '"R$ 2.487 no primeiro mês" vale mais que "dá pra ganhar uns 2 mil". Números exatos parecem verdadeiros.',
    icon: 'pin',
    source: 'Passo 5 — Aprenda a Contar',
  },
  {
    id: 'dp-18',
    title: 'Follow-up Não É Perseguição',
    body: 'A diferença é simples: perseguição cobra. Follow-up entrega valor. Cada contato tem que ter algo novo.',
    icon: 'repeat',
    source: 'Passo 10 — Acompanhamento',
  },
  {
    id: 'dp-19',
    title: 'Vulnerabilidade Conecta',
    body: 'Sua história não é um outdoor — é uma carta. As pessoas conectam com imperfeição, não com perfeição.',
    icon: 'heart_broken',
    source: 'Passo 3 — Sua História',
  },
  {
    id: 'dp-20',
    title: 'O Custo da Inação',
    body: 'Se você NÃO começar hoje, o que muda? A pergunta não é "e se der errado?" — é "e se der certo e você não estiver aqui?".',
    icon: 'hourglass_bottom',
    source: 'Fechamento',
  },
  {
    id: 'dp-21',
    title: '1x1 Semanal é Sagrado',
    body: '30-45 min, mesmo dia, mesmo roteiro: celebrar, revisar números, planejar, comprometer. Nunca pule.',
    icon: 'event',
    source: 'Duplicação — Plano 1x1',
  },
];

/** Retorna a pílula do dia baseado no dayOfYear. Sempre a mesma por dia. */
export function getDailyPill(): DailyPill {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return DAILY_PILLS[dayOfYear % DAILY_PILLS.length]!;
}
