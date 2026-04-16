import type { GoldenRule } from '@ltypes/content';

/**
 * As 4 Regras de Ouro do marketing de rede — compatível com a estrutura
 * rica que inclui ícone e explicação prática.
 */
export const GOLDEN_RULES_DETAIL: GoldenRule[] = [
  {
    rule: 'Seja produto do produto',
    explanation:
      'Use o que você vende, todos os dias. Sua credibilidade vem da sua experiência real. Quem não usa, não recomenda com convicção — e o lead sente em 5 segundos.',
    icon: 'spa',
  },
  {
    rule: 'Duplique o que funciona',
    explanation:
      'O que você faz tem que ser simples o suficiente pra quem entrou semana passada fazer igual. Técnicas geniais e personalizadas não duplicam. Sistema simples escala.',
    icon: 'content_copy',
  },
  {
    rule: 'Acompanhe sempre sua equipe',
    explanation:
      '1x1 semanal com cada líder direto, sem falha. Novo consultor que não é acompanhado desiste em 60 dias. Líder abandonado vira ex-líder em 90. Presença é o maior investimento que você faz.',
    icon: 'groups',
  },
  {
    rule: 'Mantenha simples para qualquer um copiar',
    explanation:
      'Resista à tentação de complicar. Scripts genéricos, processos curtos, ferramentas universais. O negócio cresce quando a Dona Maria, o Zé do posto e o médico usam o mesmo sistema.',
    icon: 'auto_awesome',
  },
];

/** Versão legada (strings) mantida pra compat com UI antiga. */
export const GOLDEN_RULES: string[] = GOLDEN_RULES_DETAIL.map((r) => r.rule);
