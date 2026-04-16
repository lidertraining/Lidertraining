import type { WhatsAppTemplate } from '@ltypes/content';

/**
 * Biblioteca de templates de WhatsApp por cenário.
 * Aparece no AgentsTab (biblioteca de scripts), permite copiar com 1 clique.
 * Variáveis entre [colchetes] devem ser substituídas pelo consultor.
 */
export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  // ───────── PRIMEIRO CONTATO ─────────
  {
    id: 'pc-1',
    category: 'primeiro_contato',
    title: 'Reconexão após tempo',
    template:
      'Oi [nome]! Quanto tempo, né? Lembrei de você hoje e resolvi mandar uma mensagem. Como você tá? As crianças? 🧡',
    variables: ['nome'],
    useWhen: 'Contato morno (3+ meses sem falar). Abra a janela antes de qualquer proposta.',
  },
  {
    id: 'pc-2',
    category: 'primeiro_contato',
    title: 'Rapport com comentário sobre post',
    template:
      'Oi [nome], vi seu post sobre [assunto] e concordei muito. Você tá pensando em mudar alguma coisa em [área relacionada]? Curiosidade minha.',
    variables: ['nome', 'assunto', 'área relacionada'],
    useWhen: 'Lead frio que posta nas redes. Demonstra atenção real antes da proposta.',
  },
  {
    id: 'pc-3',
    category: 'primeiro_contato',
    title: 'Indicação cruzada (sem pressão)',
    template:
      'Oi [nome]! Você tem indicação de gente aberta a projetos de renda extra? Tô montando um time de qualidade e queria pessoas bem indicadas.',
    variables: ['nome'],
    useWhen: 'Quer abrir conversa sem parecer que tá vendendo. Muitas vezes o próprio lead se oferece.',
  },

  // ───────── CONVITE ─────────
  {
    id: 'cv-1',
    category: 'convite',
    title: 'Convite direto (lista quente)',
    template:
      'Oi [nome]! Vou direto: entrei num projeto novo que tá mudando minha rotina e lembrei de você. Queria te mostrar em 20 minutos — amanhã de manhã ou terça à tarde, qual fica melhor?',
    variables: ['nome'],
    useWhen: 'Pessoas próximas (família, melhores amigos). Direto, sem rodeio.',
  },
  {
    id: 'cv-2',
    category: 'convite',
    title: 'Convite ponte (lead curioso)',
    template:
      'Oi [nome]! Tô mexendo com um projeto novo de renda extra. Vou te mandar um vídeo curto (4 min). Se fizer sentido, a gente conversa. Se não fizer, sem problema algum. Pode ser?',
    variables: ['nome'],
    useWhen: 'Lead que você sente que precisa de tempo pra processar antes da conversa.',
  },
  {
    id: 'cv-3',
    category: 'convite',
    title: 'Convite pra evento do time',
    template:
      'Oi [nome]! Vai ter uma live do meu time na [dia/hora] sobre renda paralela. 1 hora, gratuita, bem prática. Te coloquei na lista. Topa aparecer?',
    variables: ['nome', 'dia/hora'],
    useWhen: 'Quando há evento agendado. Formato "curador" — você indica, não vende.',
  },
  {
    id: 'cv-4',
    category: 'convite',
    title: 'Convite pra casal',
    template:
      'Oi [nome]! Tô num projeto que tem tudo a ver com o momento de vocês. Queria marcar uma conversa com você e [cônjuge] juntos, 40 minutos. Decisão conjunta é mais leve. Quinta 20h ou sexta 19h, qual dia funciona pros dois?',
    variables: ['nome', 'cônjuge'],
    useWhen: 'Casais. Sempre proponha apresentação para os 2 juntos.',
  },

  // ───────── FOLLOW-UP ─────────
  {
    id: 'fu-1',
    category: 'follow_up',
    title: 'Follow-up dia 1 (pós-apresentação)',
    template:
      'Oi [nome], como foi o resto do seu dia? Só passando pra confirmar que recebeu o material que mandei depois da conversa. Alguma dúvida que apareceu?',
    variables: ['nome'],
    useWhen: '24h após apresentação. Pergunta de baixa tensão.',
  },
  {
    id: 'fu-2',
    category: 'follow_up',
    title: 'Follow-up dia 3 (valor novo)',
    template:
      'Oi [nome]! Ouvi um áudio rapidinho (4 min) que acho que tem muito a ver com o que a gente conversou. Quer que eu te mande?',
    variables: ['nome'],
    useWhen: '3-4 dias após apresentação. Entrega valor, não cobra.',
  },
  {
    id: 'fu-3',
    category: 'follow_up',
    title: 'Follow-up dia 7 (pergunta de decisão)',
    template:
      'Oi [nome], passando rapidinho. Pra eu saber como te ajudar melhor: você tá mais pro sim, mais pro não ou ainda 50/50? Qualquer resposta é OK — só quero saber se sigo contigo ou não.',
    variables: ['nome'],
    useWhen: 'Semana após apresentação, sem resposta clara. Profissional e objetivo.',
  },
  {
    id: 'fu-4',
    category: 'follow_up',
    title: 'Último follow-up (desbloqueia ou encerra)',
    template:
      'Oi [nome], vou parar de te mandar mensagem sobre o projeto pra não virar chato, tá? Se um dia quiser conversar de novo, é só me chamar. Torço muito por você de qualquer jeito 🧡',
    variables: ['nome'],
    useWhen: 'Após 3-4 follow-ups sem resposta. Libera o lead sem queimar a ponte.',
  },

  // ───────── OBJEÇÕES (via WhatsApp) ─────────
  {
    id: 'ob-1',
    category: 'objecao',
    title: 'Responde "manda por aqui"',
    template:
      'Entendo que dá vontade de já ver, mas merece uma conversa com calma — são 20 min, cabe números, cabe dúvidas. Se eu mandar por aqui, você vai ficar com dúvidas e eu não vou poder te responder na hora. Amanhã 19h ou sábado 10h?',
    variables: [],
    useWhen: 'Lead pede informações por texto. Devolve pra marcar apresentação.',
  },
  {
    id: 'ob-2',
    category: 'objecao',
    title: 'Responde "não tenho tempo"',
    template:
      'Entendo totalmente. Justamente por isso fiz o projeto — é pra quem não tem tempo e quer criar tempo. Vou te perguntar diferente: você consegue 20 min em algum momento nos próximos 10 dias? Pode ser domingo, pode ser no almoço. Topa?',
    variables: [],
    useWhen: 'Objeção mais comum. Reenquadrar como o motivo pra começar, não pra recusar.',
  },

  // ───────── FECHAMENTO ─────────
  {
    id: 'fc-1',
    category: 'fechamento',
    title: 'Resumo antes do fechamento',
    template:
      'Oi [nome], antes de a gente decidir: lembra o que você me disse no começo? Que queria [dor X]. O que mostrei resolve isso e mais [benefício Y]. Faz sentido a gente avançar?',
    variables: ['nome', 'dor X', 'benefício Y'],
    useWhen: 'Fechamento por WhatsApp quando a apresentação foi presencial ou online. Recapitulação.',
  },
  {
    id: 'fc-2',
    category: 'fechamento',
    title: 'Link + dados pra cadastro',
    template:
      'Beleza! Tô muito feliz com sua decisão. Vou te mandar o link pra cadastro: [link]. Preciso dos seus dados: nome completo, CPF, endereço e melhor e-mail. Mandamos juntos agora?',
    variables: ['link'],
    useWhen: 'Após o "sim". Mantenha energia e guie passo a passo.',
  },

  // ───────── PÓS-VENDA ─────────
  {
    id: 'pv-1',
    category: 'pos_venda',
    title: 'Boas-vindas consultor dia 1',
    template:
      'Oi [nome]!! Bem-vindo(a) ao time! 🎉 Amanhã a gente começa com o FIR (os primeiros 7 dias de onboarding). Vou te mandar o link do app agora. Antes disso, um abraço — sua decisão vai mudar muita coisa. Conta comigo.',
    variables: ['nome'],
    useWhen: 'Logo após fechamento. Consolidar decisão com afeto e direção clara.',
  },
  {
    id: 'pv-2',
    category: 'pos_venda',
    title: 'Check-in semana 1',
    template:
      'Oi [nome], fim da primeira semana! Como você tá se sentindo? Já bateu as primeiras metas do FIR? Se tiver alguma dúvida, manda áudio que eu respondo com calma.',
    variables: ['nome'],
    useWhen: 'Dia 7 pós-cadastro. Abre espaço pra dúvida antes de virar problema.',
  },
  {
    id: 'pv-3',
    category: 'pos_venda',
    title: 'Reativação (consultor parado)',
    template:
      'Oi [nome]! Senti sua falta na última reunião do time. Tá tudo bem? Às vezes a gente se desconecta por mil motivos. Topa uma call de 20 min nessa semana pra eu entender se posso te ajudar com algo?',
    variables: ['nome'],
    useWhen: 'Consultor que sumiu há 14+ dias. Abordagem humana, sem cobrança.',
  },
  {
    id: 'pv-4',
    category: 'pos_venda',
    title: 'Celebração de marco (1º pedido, 1ª apresentação, etc.)',
    template:
      'Oi [nome]!! 🎉 Vi que você fez [marco]. Isso é muito importante — a maioria das pessoas nem chega aqui. Você tá no caminho certo. Posta nos stories com orgulho, não tem que esconder não!',
    variables: ['nome', 'marco'],
    useWhen: 'Sempre que o consultor bater primeiro marco. Reforço positivo imediato.',
  },
];
