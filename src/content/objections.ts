import type { Objection } from '@ltypes/content';

/**
 * 15 objeções reais + resposta estruturada (sinto-senti-percebi ou direta)
 * + contexto (quando aparece) + followUp (pergunta que devolve o fechamento).
 */
export const OBJECTIONS: Objection[] = [
  {
    objection: 'Não tenho dinheiro',
    response:
      'Entendo perfeitamente — muita gente começa justamente por isso. O investimento inicial é menor que o almoço de uma semana. E o que você vai receber de volta, se fizer o básico, paga o kit no primeiro mês. Quanto você conseguiria separar sem apertar seu orçamento?',
    context: 'Aparece em 60% das apresentações. Geralmente é desculpa confortável.',
    followUp: 'Se fosse um valor parcelado, isso tornaria possível começar?',
  },
  {
    objection: 'Isso é pirâmide?',
    response:
      'É uma pergunta justa. Pirâmide é crime porque não tem produto real — só entrada de gente. Aqui a gente vende produto que milhões de pessoas consomem todo mês. O ganho vem da venda e do desenvolvimento da equipe, e a empresa existe há [X anos] totalmente regulada. Faz diferença pra você saber isso?',
    context: 'Comum com gente que já teve alguém da família em esquema ruim.',
    followUp: 'Posso te mostrar como a ANFIP e o Procon classificam nossa empresa?',
  },
  {
    objection: 'Não tenho tempo',
    response:
      'Ninguém tem tempo — tempo se cria. Você precisa de 1 a 2 horas por dia, no seu próprio ritmo. Pode ser na hora do almoço, depois das crianças dormirem, no deslocamento. Quanto tempo você já gasta por dia no celular sem propósito?',
    context: 'Aparece muito com mãe, estudante, quem trabalha CLT pesado.',
    followUp: 'Se você tivesse 2 horas livres hoje, em que usaria?',
  },
  {
    objection: 'Preciso pensar',
    response:
      'Claro, é normal. Me ajuda: o que exatamente precisa ser pensado? Geralmente cabe em 3 caixas: dinheiro, tempo ou opinião de alguém. Se eu souber qual é a sua, posso responder agora e você pensa com a resposta na mão.',
    context: 'Objeção-guarda-chuva. Sempre tem algo específico por trás.',
    followUp: 'Qual dessas 3 caixas é a sua: dinheiro, tempo ou opinião de alguém?',
  },
  {
    objection: 'Meu cônjuge não vai aceitar',
    response:
      'Entendo. Que tal fazermos juntos uma apresentação com ele(a)? Eu mostro o plano pra vocês dois, respondo as dúvidas, e aí vocês decidem juntos. Assim nenhum dos dois fica com a decisão sozinho.',
    context: 'Muito comum com casais. O não é do casal, não da pessoa.',
    followUp: 'Qual seria um bom horário pros dois na semana que vem?',
  },
  {
    objection: 'Não tenho perfil pra vender',
    response:
      'Também achei isso no começo. Mas esse negócio não é sobre vender produto — é sobre indicar o que funciona pra você. Você já indicou um filme, um restaurante, um médico? Então você já vende todo dia, só não cobra.',
    context: 'Gente tímida, introvertida ou com vergonha.',
    followUp: 'Se fosse só compartilhar o que você usa com quem você confia, você topava?',
  },
  {
    objection: 'Não conheço ninguém',
    response:
      'Eu também achava isso no dia 1. Quando sentei e listei de verdade, cheguei a 120 nomes. Vamos fazer esse exercício juntos em 10 minutos? Aposto que você vai ter pelo menos 50.',
    context: 'Quase sempre mentira mental — a pessoa tem WhatsApp com 500 contatos.',
    followUp: 'Me deixa te ajudar a listar agora — tem o app pra isso, importa seus contatos do celular.',
  },
  {
    objection: 'Já tentei algo parecido e não deu certo',
    response:
      'Agradeço a honestidade. Isso é importante saber. O que exatamente não deu certo na outra vez? [ouve]. Nosso sistema foi desenhado pra resolver justamente isso. Posso te mostrar a diferença?',
    context: 'Valioso — a pessoa já pensou no tema. Só precisa de diferenciação.',
    followUp: 'Se a gente eliminasse o problema X que você teve lá, isso mudaria sua decisão?',
  },
  {
    objection: 'Parece muito bom pra ser verdade',
    response:
      'Respeito sua desconfiança — é saudável. Te convido a fazer o seguinte: conversa com pelo menos 2 pessoas que já estão no projeto por mais de 1 ano. Pergunta o que elas viveram. Faz isso e depois a gente decide?',
    context: 'Pessoa cética, racional. Evidência social funciona melhor que argumento.',
    followUp: 'Quer que eu te passe o contato de 2 pessoas da equipe pra você perguntar o que quiser?',
  },
  {
    objection: 'Quero ver resultado primeiro',
    response:
      'Faz sentido. Mas me ajuda a entender: resultado de quem? Se você quer ver o resultado dos outros, já mostrei X casos. Se quer ver seu próprio resultado, só tem um jeito: começar. Qual desses dois resultados falta?',
    context: 'Procrastinação elegante. A pessoa quer garantia antes de tentar.',
    followUp: 'O que você precisa ver acontecer com você nas primeiras 4 semanas pra se sentir confiante?',
  },
  {
    objection: 'Não quero incomodar meus amigos',
    response:
      'Concordo 100%. A gente também odeia quem faz isso. Por isso o método aqui não é spam — é conversa com quem realmente pode se interessar. Você só fala com 5 pessoas na primeira semana, todas que você escolheria. Faz diferença?',
    context: 'Medo de reprovação social. Muito real.',
    followUp: 'Se a abordagem fosse totalmente no seu tempo e escolha, isso tiraria esse medo?',
  },
  {
    objection: 'E se eu não conseguir?',
    response:
      'Vale a pena fazer essa pergunta ao contrário: e se você conseguir? O pior cenário é você tentar por 90 dias e voltar exatamente pra onde você tá hoje. O melhor é mudar sua vida. Risco pequeno, ganho enorme.',
    context: 'Medo de fracasso. Foque em reduzir percepção de risco.',
    followUp: 'Se eu te garantir que vou te acompanhar de perto nos 90 primeiros dias, topava tentar?',
  },
  {
    objection: 'Vou esperar o melhor momento',
    response:
      'Momento perfeito não existe. Todo mundo que tá ganhando hoje começou quando o momento era ruim. Eu mesmo comecei com [sua dor na época]. A única coisa que muda tudo é a decisão, não o calendário. O que você tá esperando, exatamente?',
    context: 'Procrastinação. Identifique o gatilho real por trás.',
    followUp: 'Se a gente começasse em um ritmo 50% mais leve por 30 dias, ajudaria agora?',
  },
  {
    objection: 'Não gosto dessa empresa / ouvi coisas',
    response:
      'Respeito sua informação. Me conta o que você ouviu, sem compromisso — eu quero saber se é fato ou boato. Trabalho aqui há [tempo] e nunca tive um problema. Mas é justo a gente chegar na mesma página antes.',
    context: 'Muitas vezes informação antiga ou de ex-consultor ressentido.',
    followUp: 'Se eu mostrar os dados reais sobre o que você ouviu, você reconsidera?',
  },
  {
    objection: 'Deixa eu falar com minha mãe / pai',
    response:
      'Pode falar! Só uma coisa: chama seus pais pra assistir uma apresentação comigo junto. Muita gente mudou a cabeça quando viu pessoalmente. Eu também convenci meu pai assim — ele era o mais cético.',
    context: 'Comum com jovens até 30 anos morando com os pais.',
    followUp: 'Que dia vocês três teriam 40 min livres?',
  },
];
