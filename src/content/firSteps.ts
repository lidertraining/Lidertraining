import type { FIRStep } from '@ltypes/content';

/**
 * First Introduction Reality — 8 etapas de onboarding.
 * Objetivo: nos primeiros 7 dias do consultor novo, garantir
 * que ele cumpra os fundamentos sem precisar decorar nada.
 */
export const FIR_STEPS: FIRStep[] = [
  {
    id: 1,
    title: 'Leia o Manual do Consultor',
    rewardXP: 50,
    body: `**Conheça a empresa antes de representar a empresa.**

O manual não é burocrático — é sua base de credibilidade. Quando o lead perguntar "há quanto tempo a empresa existe?", "de onde vem o produto?", "como funciona o pagamento?", você precisa responder em 5 segundos. Sem hesitar.

### O que ler primeiro

1. Tempo de mercado e países de atuação (credibilidade)
2. Linha de produtos essenciais (o que você vai usar e vender)
3. Plano de compensação simplificado (as 3 principais bonificações)
4. Código de conduta (o que pode e o que não pode)

Leia o manual inteiro, mas priorize esses 4 itens — são o que aparece nas objeções reais.`,
    checklist: [
      'Abri o PDF/link oficial do manual',
      'Anotei o tempo de mercado da empresa',
      'Listei os 5 produtos principais',
      'Entendi as 3 bonificações centrais',
      'Salvei o manual no celular para consulta offline',
    ],
    tip: 'Se o manual tiver mais de 50 páginas, comece pelo índice e marque os 4 itens acima. O resto pode ler por diagonal.',
  },

  {
    id: 2,
    title: 'Assista ao vídeo de boas-vindas',
    rewardXP: 50,
    body: `**Conecte-se com quem construiu o sistema.**

O vídeo oficial de boas-vindas traz o fundador, os valores e a visão de longo prazo. Assistir isso antes de começar a prospectar ajuda em 2 coisas:

1. Você passa emoção ao falar da empresa (porque viu a emoção de quem criou).
2. Você pega frases-chave prontas pra usar quando o lead perguntar "por que essa empresa?".

### O que anotar enquanto assiste

- Frase de impacto do fundador (pra repetir depois)
- Dado que você não sabia (diferencial de mercado)
- Valor da empresa que conecta com você pessoalmente`,
    checklist: [
      'Assisti o vídeo até o final',
      'Anotei 1 frase de impacto pra usar',
      'Anotei 1 dado diferencial',
      'Identifiquei o valor que mais conectou comigo',
    ],
    tip: 'Assista com fone e de boa — não em paralelo com outra coisa. Vale a concentração.',
  },

  {
    id: 3,
    title: 'Monte sua lista inicial (mín. 50 nomes)',
    rewardXP: 100,
    body: `**Sua lista é seu petróleo.**

No passo 2 da Jornada você vai se aprofundar — mas pra destravar o FIR, preciso que você já tenha o piso de 50 nomes. É o mínimo pra começar a prospectar sem travar.

### Onde buscar (em 30 minutos)

- **Celular:** puxe os contatos via importador do app (botão "Importar")
- **WhatsApp:** últimas 100 conversas
- **Instagram/Facebook:** últimos 3 meses de interação
- **Memória:** família, trabalho, escola, esporte, vizinhança

Não filtre. Escreve primeiro, decide depois.`,
    checklist: [
      'Importei contatos do celular (.vcf ou Contact Picker)',
      'Adicionei pelo menos 10 nomes manualmente',
      'Cheguei a 50 nomes (meta mínima)',
      'Classifiquei cada lead por temperatura (quente/morno/frio)',
    ],
    tip: 'Se travar, pergunta pra alguém próximo "quem são as 10 pessoas que você acha que eu deveria falar?". Isso destrava.',
  },

  {
    id: 4,
    title: 'Faça seu primeiro pedido pessoal',
    rewardXP: 150,
    body: `**Seja produto do produto a partir de hoje.**

Você não pode vender o que não usa. Seu primeiro pedido é o gatilho do passo 3 da Jornada (Vire Produto) e ativa 3 coisas:

1. **Experiência real:** você vai ter o que falar quando o lead perguntar "você usa?"
2. **Ponto de consultor:** sua pontuação mensal começa a girar
3. **Compromisso:** quem investe em si mesmo leva o negócio a sério

### O que incluir no pedido

- Kit essencial da linha principal (uso diário)
- Pelo menos 1 produto "uau" (que dê resultado visível — pra virar seu case)
- Material de apoio se tiver (catálogos, amostras, cartão do consultor)`,
    checklist: [
      'Defini o orçamento do pedido',
      'Escolhi o kit essencial',
      'Incluí 1 produto "uau"',
      'Fiz o pedido no sistema oficial',
      'Registrei o pedido no Prospector (auto-venda)',
    ],
    tip: 'Se orçamento tá apertado, conversa com seu upline sobre o pedido mínimo. O importante é dar o primeiro passo.',
  },

  { id: 5, title: 'Agende sua primeira apresentação', rewardXP: 100 },
  { id: 6, title: 'Convide 3 pessoas', rewardXP: 150 },
  { id: 7, title: 'Participe de uma reunião online', rewardXP: 50 },
  { id: 8, title: 'Complete a avaliação de scout', rewardXP: 100 },
];
