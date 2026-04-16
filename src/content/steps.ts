import type { JourneyStep } from '@ltypes/content';

/**
 * Fallback dos 11 passos da jornada (migrado do HTML original).
 * A fonte de verdade em produção é a tabela public.journey_steps.
 *
 * Cada passo traz:
 *  - goal: objetivo em uma frase
 *  - body: teoria em markdown
 *  - tasks: práticas passo a passo
 *  - scripts: falas prontas contextualizadas
 *  - examples: casos reais curtos
 *  - mistakes: erros comuns a evitar
 *  - timeMinutes: estimativa de execução
 */
export const STEPS: JourneyStep[] = [
  {
    id: 0,
    name: 'Defina seu Sonho',
    icon: 'favorite',
    color: 'am',
    description: 'Por que você está aqui?',
    goal: 'Criar uma razão tão poderosa que sustente cada decisão do negócio — principalmente nos dias difíceis.',
    timeMinutes: 45,
    body: `**O "porquê" é o motor do negócio.**

Marketing de rede não é vendido por scripts perfeitos — é vendido por pessoas que acreditam. E quem acredita tem uma razão maior que o medo.

### Os 3 níveis de sonho

1. **Superficial** — "quero ganhar R$ 2.000 extras". É racional, útil, mas não sustenta nos dias ruins.
2. **Emocional** — "quero tirar minha mãe do aluguel". Esse mexe com a gente.
3. **Identidade** — "quero ser a pessoa que mudou a história da minha família". É o que carrega por 10 anos.

Seu sonho precisa ter os 3. Sem o terceiro, você desiste na primeira objeção.

### Exercício da cadeira vazia

Feche os olhos. Imagine daqui a 3 anos. Você sentou numa cafeteria com uma pessoa que você admira. Ela pergunta: "me conta o que mudou na sua vida". O que você responde?

Escreve a resposta inteira no caderno deste passo.

### Regra do compartilhamento

Seu sonho só é real quando você divide com uma pessoa que importa. Conversa com seu cônjuge, seu pai, seu melhor amigo. Não é pra pedir permissão — é pra tornar público o compromisso.`,
    tasks: [
      {
        title: 'Escrever seu sonho em 1 parágrafo',
        detail: 'Use o exercício da cadeira vazia. Sem edição, sem censura. Salva no caderno deste passo.',
      },
      {
        title: 'Listar 3 motivos emocionais (não racionais)',
        detail: 'Não vale "pagar contas". Pergunte "por quê?" três vezes até chegar no motivo de verdade.',
      },
      {
        title: 'Compartilhar com alguém de confiança',
        detail: 'Ligue, mande áudio ou conte pessoalmente. Torna o compromisso público.',
      },
      {
        title: 'Criar sua imagem de referência',
        detail: 'Pode ser uma foto de uma casa, um lugar, um carro, uma cena de família. Coloca no papel de parede do celular.',
      },
    ],
    scripts: [
      {
        scenario: 'Ao compartilhar o sonho com o cônjuge',
        text: 'Amor, sentei e escrevi um compromisso comigo mesmo hoje. Quero que você leia junto porque isso vai mexer com a gente nos próximos anos. Posso te mostrar?',
      },
      {
        scenario: 'Quando um amigo zoa do sonho',
        text: 'Eu entendo que pareça grande demais. Mas eu decidi que vou tentar — e preciso dos amigos certos ao lado. Você topa torcer por mim mesmo achando improvável?',
      },
    ],
    examples: [
      'Marina, 34 anos, enfermeira: "Queria que minha filha não tivesse que pedir pra ir ao cinema". Virou a frase dela em todos os momentos difíceis dos 18 primeiros meses.',
      'Carlos, 41 anos, ex-bancário: Colou foto da esposa curada de cancer no celular. "Enquanto ela tá viva, eu vou honrar". 4 anos depois, é líder de uma equipe de 800.',
    ],
    mistakes: [
      'Escrever um sonho "inteligente" ou "razoável". Se não dá medo, não move ninguém.',
      'Guardar pra si. Sonho não-compartilhado vira desculpa.',
      'Confundir sonho com meta. Meta é o como; sonho é o porquê.',
    ],
  },

  {
    id: 1,
    name: 'Monte sua Lista',
    icon: 'list',
    color: 'am',
    description: 'Pessoas que você conhece',
    goal: 'Construir uma lista quente de no mínimo 100 nomes, sem filtrar nem pré-qualificar.',
    timeMinutes: 60,
    body: `**Sua lista é o seu estoque.**

No varejo, quem não tem estoque não vende. No nosso negócio, quem não tem lista não prospecta. Parece óbvio — mas 80% dos consultores param no primeiro "não" porque só tinham 15 nomes.

### A regra de ouro: NÃO pré-qualifique

"Ah, o João não topa isso." "A Bia tá muito bem de vida." "Meu tio é muito negativo."

**Pare.** Você não tem bola de cristal. A pior pessoa que você julgou na sua cabeça pode virar o seu melhor diamante — porque ela estava esperando alguém que acreditasse nela.

Sua missão na lista é uma só: **escrever todos os nomes que sua memória alcançar.**

### Memory jogger — 14 categorias

Use as categorias abaixo pra destravar a memória. Ponha todo mundo, sem pensar:

1. **Família** (pais, tios, primos, cunhados)
2. **Amigos próximos**
3. **Amigos do trabalho atual**
4. **Ex-colegas de trabalho**
5. **Colegas de escola/faculdade**
6. **Vizinhos (atuais e antigos)**
7. **Esporte/academia**
8. **Igreja/grupo social**
9. **Amigos do cônjuge**
10. **Pais dos amigos dos filhos**
11. **Prestadores de serviço** (dentista, cabeleireiro, mecânico, manicure)
12. **Lojistas que você frequenta**
13. **Contatos do celular que você esqueceu**
14. **Redes sociais** (últimos 3 meses de posts, likes, comentários)

### A técnica do "quem mais?"

Depois de listar, pergunte: **"quem mais?"** Pergunte 5 vezes. Vai aparecer nomes que você jurava não lembrar.

### Importar do celular

Nesse app você pode puxar os contatos do WhatsApp direto. Cada contato que você importa vira +15 XP e já entra no Prospector como "frio", pronto pra você classificar.`,
    tasks: [
      {
        title: 'Importar contatos do celular (.vcf)',
        detail: 'Use o botão "Importar contatos" abaixo. Exporte do app Contatos e traga pra cá.',
      },
      {
        title: 'Preencher as 14 categorias (min. 5 nomes cada)',
        detail: 'Sem filtrar. Quem aparecer na memória, anota.',
      },
      {
        title: 'Revisar últimos 3 meses de WhatsApp e redes',
        detail: 'Quem curtiu, quem comentou, quem mandou mensagem. Todo mundo entra.',
      },
      {
        title: 'Chegar a 100 nomes (meta) ou 50 (mínimo)',
        detail: 'Se bateu 100, libera o XP extra. 50 é o piso pra liberar o próximo passo.',
      },
      {
        title: 'Classificar por temperatura (quente/morno/frio)',
        detail: 'Quente: falou nos últimos 30 dias. Morno: nos últimos 6 meses. Frio: antes disso.',
      },
    ],
    scripts: [
      {
        scenario: 'Ao pedir ajuda pra lembrar nomes (ex: cônjuge)',
        text: 'Amor, tô fazendo um trabalho novo e preciso listar as pessoas que a gente conhece. Quem são os 10 amigos mais próximos seus que vieram na minha cabeça: [lê a lista]. Quem tá faltando aí?',
      },
      {
        scenario: 'Ao se pegar querendo tirar um nome',
        text: '(pra você mesmo) Se eu não sei a resposta dela, eu não posso responder por ela. Deixa na lista.',
      },
    ],
    examples: [
      'João passou 2h listando e chegou a 137 nomes. Tinha jurado que "só conhecia umas 30 pessoas".',
      'Renata tirou o tio "negativo" da lista. 3 meses depois soube que ele entrou em outra empresa porque "ninguém nunca tinha me convidado de verdade".',
    ],
    mistakes: [
      'Filtrar antes de listar. A regra é: primeiro anota, depois pensa.',
      'Fazer a lista de uma vez e nunca voltar. Lista é organismo vivo — você adiciona 2-3 nomes toda semana.',
      'Não importar os contatos do celular. Só no WhatsApp você tem 300-500 pessoas esperando.',
    ],
  },

  {
    id: 2,
    name: 'Sua História',
    icon: 'auto_stories',
    color: 'am',
    description: 'Conecte com emoção',
    goal: 'Criar uma história de 90 segundos que gera conexão antes mesmo da apresentação do negócio.',
    timeMinutes: 30,
    body: `**As pessoas compram a história antes do plano.**

Ninguém entra no negócio por causa do plano de marketing. Entra porque se viu na sua história. "Se ele conseguiu, eu também consigo."

### A fórmula dos 3 atos (90 segundos)

**Ato 1 — Antes (20s):** como era sua vida. Qual era a dor, o tédio, a frustração. Seja concreto: horários, dinheiro, sensação.

**Ato 2 — O encontro (30s):** como você conheceu a oportunidade. Quem te apresentou. Sua dúvida inicial. O que te fez topar.

**Ato 3 — Depois (40s):** o que mudou. Resultados emocionais primeiro (liberdade, orgulho, alívio), depois números se for relevante.

### A regra da vulnerabilidade

Sua história não é um outdoor — é uma carta. As pessoas conectam com **imperfeição**, não com perfeição. Conte o medo, a dúvida, a noite em claro. Isso gera empatia.

### Se você é novo (ainda sem resultado)

Sem problema. Sua história vira "história do meu upline" — conta a história de quem te patrocinou, com a mesma fórmula. Ou conta a sua expectativa: "eu entrei há 3 semanas porque vi na minha patrocinadora o que eu quero ser daqui 2 anos".`,
    tasks: [
      {
        title: 'Escrever os 3 atos no caderno',
        detail: 'Máximo 2 parágrafos por ato. Se passar disso, cortar.',
      },
      {
        title: 'Gravar um áudio de 90 segundos no WhatsApp',
        detail: 'Fale pra você mesmo. Ouça. Refine. Regrave.',
      },
      {
        title: 'Testar a história com 3 pessoas próximas',
        detail: 'Peça feedback: "me emocionou? me deu vontade de saber mais?" Ajuste conforme a reação.',
      },
      {
        title: 'Memorizar as frases-chave (não o texto todo)',
        detail: 'O abertura e o fim precisam sair naturais. O meio pode variar.',
      },
    ],
    scripts: [
      {
        scenario: 'Abertura universal',
        text: 'Posso te contar rapidinho como cheguei nesse projeto? É uma história de 1 minuto.',
      },
      {
        scenario: 'Exemplo real (fórmula)',
        text: 'Eu era bancário, trabalhava 12h por dia, chegava em casa e meu filho já tava dormindo. Uma amiga me mandou um áudio falando de um projeto que dava pra fazer no tempo vago. Achei cara, desconfiei, mas topei ouvir. Já estou há 18 meses aqui. Hoje eu trabalho de casa, levo meu filho na escola todo dia e rendo mais do que rendia no banco. Por isso eu queria te mostrar também.',
      },
    ],
    examples: [
      'Rafaela (dentista): "Minha vida era consultório, contas, consultório. Engravidei e não tinha como parar. Entrei pra fazer renda extra e hoje sou a provedora principal da casa, trabalhando meio período."',
      'Luiz (aposentado): "Eu tinha 63 anos quando entrei. Todo mundo achou que eu era velho demais. Hoje tenho 66 e minha equipe passa de 300 pessoas em 4 estados."',
    ],
    mistakes: [
      'Começar falando da empresa. Ninguém se importa ainda. Começa sempre por você.',
      'Contar tudo — cada detalhe da jornada de 3 anos. É 90 segundos. Edita.',
      'Esconder a dúvida que você teve. A dúvida é a ponte entre você e o lead.',
    ],
  },

  {
    id: 3,
    name: 'Vire Produto',
    icon: 'spa',
    color: 'am',
    description: 'Use o que vende',
    goal: 'Usar o produto com consistência até virar uma experiência pessoal concreta que você consegue recomendar com convicção.',
    timeMinutes: 40,
    body: `**Consultor que não usa o produto é vendedor, não consultor.**

A primeira regra de ouro do negócio: **seja produto do produto.** Você não está vendendo um item; está compartilhando uma solução que funcionou pra você.

### Por que usar é inegociável

1. **Credibilidade:** o lead sente em 5 segundos se você realmente usa.
2. **Repertório:** histórias de uso são seu maior patrimônio de vendas.
3. **Consumo recorrente:** seu próprio consumo mantém a pontuação viva.
4. **Dignidade:** você não pode pedir pra alguém fazer algo que você mesmo não faz.

### O teste dos 21 dias

Use TODOS os produtos da linha essencial por 21 dias seguidos. Por quê 21? Porque é o tempo que leva pra você ter:
- Pelo menos uma história boa (que você vai contar pelos próximos 2 anos)
- Pelo menos uma comparação "antes/depois"
- Pelo menos um amigo perguntando "o que você tá fazendo de diferente"

### Documente

Durante os 21 dias, **tire fotos**. Antes/depois do rosto. Antes/depois de um espaço. Gravá vídeo curto falando sobre a experiência. Isso vira conteúdo de redes sociais — e vira munição pra prospecção.

### Kit essencial

Se a empresa tem um "kit consultor" ou "kit de uso pessoal", compra. Isso não é custo — é investimento no seu próprio estoque de argumentos.`,
    tasks: [
      {
        title: 'Fazer pedido do kit pessoal (ou produtos essenciais)',
        detail: 'Se ainda não fez, faz agora. Sem produto em casa, não tem passo 4.',
      },
      {
        title: 'Começar o teste dos 21 dias hoje',
        detail: 'Marca no calendário. Usa todo dia. Não pula.',
      },
      {
        title: 'Tirar foto "antes" de tudo',
        detail: 'Foto do rosto de manhã, da pele, do ambiente — qualquer coisa que o produto vá transformar.',
      },
      {
        title: 'Gravar vídeo curto (30s) no dia 1',
        detail: '"Comecei hoje. Me siga nos próximos 21 dias." Posta ou guarda pra posterior.',
      },
      {
        title: 'Anotar 3 histórias de uso na primeira semana',
        detail: 'Qualquer coisa que você notar. "Durmo melhor." "Economizei tempo." "Minha mãe elogiou." Tudo conta.',
      },
    ],
    scripts: [
      {
        scenario: 'Quando alguém nota a mudança e pergunta',
        text: 'Eu comecei a usar uns produtos novos da empresa onde eu trabalho e mudou pra caramba. Se você quiser, eu te mando uma foto de antes pra você ver a diferença.',
      },
      {
        scenario: 'Ao recomendar sem parecer vendedor',
        text: 'Não tô te vendendo nada, tá? Só tô falando porque eu uso há X meses e a diferença pra mim foi enorme. Se quiser testar, eu te consigo um.',
      },
    ],
    examples: [
      'Camila (cosméticos): documentou 90 dias de uso em stories. Virou case da empresa e vendeu 40 kits só por referência do próprio uso.',
      'Ricardo (suplementos): perdeu 11 kg em 4 meses usando a linha. A esposa, cética, entrou na equipe dele depois de ver o resultado.',
    ],
    mistakes: [
      'Vender sem usar. O lead sente. E quando sente, não volta.',
      'Usar só um produto da linha. O kit faz parte do "ser produto".',
      'Não documentar. Experiência não-registrada vira esquecimento em 30 dias.',
    ],
  },
  {
    id: 4,
    name: 'Aprenda a Contar',
    icon: 'psychology',
    color: 'am',
    description: 'Storytelling de impacto',
    goal: 'Transformar informação técnica em história que emociona e move à ação.',
    timeMinutes: 35,
    body: `**Fato informa. História muda a vida.**

Dizer "a empresa paga 30% de bônus por indicação" é informação. Dizer "a Rose indicou a prima de manhã e à noite já tinha R$ 420 na conta" é história. A segunda vende 10x mais.

### Estrutura AIDA em storytelling

- **A (Atenção):** comece com uma frase que quebra o piloto automático. "Olha o que aconteceu com a Rose ontem..."
- **I (Interesse):** dê o contexto humano. Quem é a Rose, como tava antes, o que estava em jogo.
- **D (Desejo):** mostre a transformação. Detalhes sensoriais: o que ela sentiu, o que a família disse.
- **A (Ação):** convide a pessoa pra própria história. "Topa a gente fazer o mesmo teste com você?"

### Gatilhos mentais que funcionam

1. **Prova social:** "mais de 400 pessoas do nosso time fizeram isso"
2. **Escassez:** "essa turma de onboarding fecha sexta"
3. **Autoridade:** cite quem já fez (seu upline, alguém conhecido)
4. **Reciprocidade:** entregue valor primeiro (áudio, e-book, dica) — aí convida
5. **Coerência:** "você mesmo disse que queria mais tempo com os filhos"

### Regra dos números pequenos

Seja específico. "R$ 2.487 no primeiro mês" vale mais que "dá pra ganhar uns 2 mil". Números exatos parecem verdadeiros.

### Pratique em voz alta

Uma história contada na cabeça soa pronta. Contada na boca, você descobre onde trava. Grave 3 histórias diferentes e ouça cada uma.`,
    tasks: [
      {
        title: 'Escolher 3 histórias da sua equipe',
        detail: 'Uma de dinheiro, uma de tempo, uma de superação pessoal.',
      },
      {
        title: 'Escrever cada uma na fórmula AIDA',
        detail: 'Máximo 2 minutos de fala por história. Cronometre.',
      },
      {
        title: 'Gravar áudio das 3 no WhatsApp',
        detail: 'Mande pra você mesmo. Ouça. O que te emocionou? O que soou mecânico?',
      },
      {
        title: 'Anotar 5 gatilhos que você usa naturalmente',
        detail: 'Escolha os 5 mais autênticos pra sua personalidade. Não force os outros.',
      },
    ],
    scripts: [
      {
        scenario: 'História de dinheiro',
        text: 'Quer ver o que aconteceu na semana passada? A Carol fechou uma venda de R$ 890 num almoço de domingo. Ela mesma me mostrou a transferência. O que isso paga? Dois meses de escola do filho dela. Isso no tempo que a gente gasta tomando café.',
      },
      {
        scenario: 'História de tempo',
        text: 'O Marcelo era motorista de aplicativo. Trabalhava 14 horas por dia. Entrou no projeto há 8 meses. Mês passado ele largou o carro. Hoje ele busca o filho na escola toda tarde.',
      },
    ],
    examples: [
      'Em uma live de recrutamento, quem conta 3 histórias reais converte 40% a mais que quem só mostra slides do plano.',
      'A "história da tia que não acreditava" virou lendária num time — contada do mesmo jeito por 50 consultores, recrutou mais gente que qualquer outra.',
    ],
    mistakes: [
      'Inventar história. Uma mentira descoberta derruba anos de credibilidade.',
      'Contar história sem nome. "Uma pessoa aí fez" não cola. Nome, idade, cidade.',
      'Entregar o número antes da emoção. Emoção primeiro, número depois.',
    ],
  },

  {
    id: 5,
    name: 'Prospecção',
    icon: 'person_search',
    color: 'am',
    description: 'Como abordar',
    goal: 'Abordar leads da sua lista com postura de profissional — sem desespero, sem script robótico, sem medo de "não".',
    timeMinutes: 45,
    body: `**Prospecção é um número, não uma emoção.**

Você não está pedindo favor. Você está oferecendo uma oportunidade que mudou sua vida — e só vai mudar a vida de quem estiver pronto. Sua missão é descobrir quem está pronto **hoje**.

### A matemática do funil

Para cada 100 abordagens → 50 topam ouvir → 20 assistem a apresentação → 8 topam começar → 3 ficam ativos nos 6 primeiros meses.

Esses números são **estatística**, não sorte. Se você ama os 3 ativos, precisa amar os 97 que disseram "não". Todo "não" te aproxima do "sim".

### As 2 posturas fatais

1. **Desespero:** "Por favor, ouve só 5 minutos". O lead sente que você precisa da venda. Fecha a porta.
2. **Arrogância:** "Vou te dar a chance da sua vida". Parece guru. Fecha a porta.

**Postura certa:** "Acho que pode ter a ver com você — mas só se for a hora. Se não for, sem problema."

### Os 3 tipos de abordagem

**Quente (lista A):** pessoas com quem você fala há menos de 30 dias. Aborde direto, sem rodeio. "Vou ser direto: tô num projeto novo e lembrei de você. Posso te mostrar?"

**Morno (lista B):** pessoas que você conhece mas não fala há meses. Quebra-gelo primeiro ("Oi! Lembrei de você hoje, como você tá?"), depois aborda.

**Frio (lista C):** pessoas de redes sociais, conhecidos de conhecidos. Aborde com conexão primeiro. Curta 3 posts, comente um. Depois manda DM.

### A regra dos 3 minutos

Primeira abordagem dura **no máximo 3 minutos**. Seu objetivo não é vender — é **marcar a apresentação**. Não apresente o plano em DM. Marca hora pra conversar com calma.`,
    tasks: [
      {
        title: 'Separar sua lista em A/B/C (quente/morno/frio)',
        detail: 'Abra o Prospector e classifique cada lead. Vai te ajudar no abordagem certa.',
      },
      {
        title: 'Abordar 10 leads quentes esta semana',
        detail: 'Use o script direto. Meta: 5 agendamentos de apresentação.',
      },
      {
        title: 'Abordar 10 leads mornos com quebra-gelo',
        detail: 'Comece reconectando. Só aborda o negócio se o rapport responder bem.',
      },
      {
        title: 'Anotar cada resposta no CRM',
        detail: 'Topou, marcou, não topou, tá pensando — tudo. Você vai voltar em 30 dias nos "tá pensando".',
      },
    ],
    scripts: [
      {
        scenario: 'Abordagem quente direta',
        text: 'Oi [nome], tô num projeto novo e fiquei pensando em você. Quero marcar 20 minutos com você pra te mostrar. Amanhã de manhã ou terça à tarde, qual fica melhor?',
      },
      {
        scenario: 'Abordagem morna com quebra-gelo',
        text: 'Oi [nome]! Sumimos, né? Lembrei de você essa semana, como vc tá? Os meninos? ... [espera responder, conversa 2-3 trocas] ... Olha, tô envolvido num projeto novo que achei a sua cara. Topa eu te mostrar em 20 minutos?',
      },
      {
        scenario: 'Resposta a "me manda um resumo por aqui"',
        text: 'Eu até te mandaria, mas é injusto com você — é melhor explicado em conversa porque tem números e sua dúvida merece resposta na hora. 20 minutos no zoom, sexta às 19h?',
      },
    ],
    examples: [
      'Lucas abordou 142 pessoas em 3 meses. 89 não toparam. 53 assistiram. 14 entraram. Dessas 14, hoje 6 são líderes.',
      'Fabíola começou pelos "impossíveis" — quem ela achava que nunca topava. 40% toparam ouvir. O "impossível" era cabeça dela.',
    ],
    mistakes: [
      'Apresentar o plano em DM. Você queima a munição sem marcar apresentação.',
      'Perguntar "tá a fim de uma renda extra?" como primeira frase. Soa vendedor.',
      'Parar de abordar depois de 3 "nãos" seguidos. Você está no começo do funil, não no fim.',
      'Não anotar a resposta. Em 30 dias você esquece quem disse o quê.',
    ],
  },
  { id: 6, name: 'Convite', icon: 'mail', color: 'am', description: 'Chame para conhecer' },
  { id: 7, name: 'Apresentação', icon: 'co_present', color: 'am', description: '4 formas de mostrar' },
  { id: 8, name: 'Fechamento', icon: 'handshake', color: 'gd', description: 'As 3 Leis' },
  { id: 9, name: 'Acompanhamento', icon: 'schedule', color: 'em', description: 'Follow-up eficiente' },
  { id: 10, name: 'Duplicação', icon: 'group_add', color: 'em', description: 'Ensine quem entrou' },
];
