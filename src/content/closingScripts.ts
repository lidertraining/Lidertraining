import type { ClosingScript } from '@ltypes/content';

/**
 * 10 scripts de fechamento prontos, com indicação de quando usar cada um.
 * Imprima, salve no celular, treine antes da primeira apresentação real.
 */
export const CLOSING_SCRIPTS: ClosingScript[] = [
  {
    name: 'Direto',
    template:
      'Você viu o plano, viu a carreira, viu os depoimentos. Pelo que a gente conversou, faz todo sentido você começar. Vamos fazer seu cadastro agora?',
    useWhen: 'Lead decidido, ritmo rápido. Nunca use com inseguro.',
  },
  {
    name: 'Consultivo',
    template:
      'Com base em tudo que você me contou — sobre [dor X], [sonho Y] e [realidade Z] — o kit que mais faz sentido pra você é o [kit específico]. Ele te dá [benefício 1], [benefício 2] e a bonificação já no primeiro mês. Posso montar seu cadastro com esse kit?',
    useWhen: 'Lead que pediu opinião, confia em você como consultor.',
  },
  {
    name: 'Alternativo',
    template:
      'Duas perguntas rápidas: você começa com o kit Start ou o kit Pro? E prefere assinar essa semana ou na próxima segunda?',
    useWhen: 'Lead decidido mas indeciso nos detalhes. Pergunta já assume o sim.',
  },
  {
    name: 'Recapitulação',
    template:
      'Deixa eu recapitular o que a gente conversou: você disse que queria [X], que te incomoda [Y] e que procura [Z]. Esse projeto te dá os três. Então me ajuda: o que falta pra gente começar hoje?',
    useWhen: 'Depois de apresentação longa com muitos pontos de conexão.',
  },
  {
    name: 'Sonho guiado',
    template:
      'Fecha os olhos comigo 10 segundos. Imagina daqui 12 meses — você levando seu filho na escola, sua rotina mais leve, uma renda extra pagando o que hoje aperta. Agora abre os olhos. Esse futuro vale começar hoje?',
    useWhen: 'Lead emocional, movido por causa/família. Poderoso se usado genuinamente.',
  },
  {
    name: 'Binário com urgência',
    template:
      'Essa turma fecha sexta-feira. Faz mais sentido você começar com a gente agora ou esperar 30 dias? Qualquer resposta é ok — só não vale ficar indefinido, porque daqui 30 dias mudou.',
    useWhen: 'Fechamento quando há um deadline real (turma, campanha, bônus).',
  },
  {
    name: 'Sinto-senti-percebi (p/ objeção)',
    template:
      'Entendo exatamente como você se sente. Eu me senti igual no começo — era a mesma dúvida. Mas o que eu percebi depois foi que [reframe da objeção em benefício]. Faz sentido?',
    useWhen: 'Tratando objeções diretas. Neutraliza resistência gerando empatia.',
  },
  {
    name: 'Custo da inação',
    template:
      'Deixa eu virar a pergunta: se você NÃO começar hoje, o que muda nos próximos 12 meses? Sua rotina continua igual, sua renda continua igual. A pergunta não é "e se der errado?" — é "e se der certo e você não estiver aqui?".',
    useWhen: 'Lead que insiste em "pensar mais". Troca o medo da tentativa pelo medo da omissão.',
  },
  {
    name: 'Fechamento do líder',
    template:
      'Pelo que você me contou e pelo seu jeito, eu te vejo liderando um time em 6 meses. Não é papo comercial — é o que eu observei aqui. Se isso faz sentido pra você, a gente começa agora e eu te treino pessoalmente. Topa?',
    useWhen: 'Lead com perfil claro de líder — empreendedor, comunicativo, ambicioso.',
  },
  {
    name: 'Decisão em casal',
    template:
      'Você tá aberto a começar, mas quer decidir com [cônjuge]. Respeito isso. Vamos fazer assim: marca os dois comigo amanhã, 40 min, eu apresento de novo pros dois juntos. Quinta às 20h ou sexta às 19h?',
    useWhen: 'Objeção "preciso falar com meu cônjuge" aparece. Nunca aceite sem reagendar os dois juntos.',
  },
];
