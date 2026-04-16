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

  {
    id: 5,
    title: 'Agende sua primeira apresentação',
    rewardXP: 100,
    body: `**Assistir à apresentação do seu upline é o atalho.**

Antes de tentar apresentar sozinho, você precisa ver alguém fazer. Uma apresentação bem-feita, assistida com atenção, te poupa 3 meses de erro por tentativa.

### Como agendar

1. Fale com seu upline e escolha uma apresentação que ele ou outro líder vá fazer essa semana.
2. Convide pelo menos 1 dos seus 50 leads pra assistir junto.
3. Marca data e horário no calendário.

### Sua função na apresentação assistida

- Assistir em silêncio (não interrompa, não complemente)
- Anotar as frases que funcionaram
- Observar como o lead reagiu em cada parte
- Ficar até o final, inclusive no fechamento

Depois, 10 minutos pra debrief: o que funcionou, o que não funcionou, o que você replicaria.`,
    checklist: [
      'Conversei com meu upline sobre horário',
      'Convidei 1 lead da minha lista',
      'Marquei no calendário',
      'Assisti a apresentação inteira',
      'Fiz debrief de 10 min com meu upline',
    ],
    tip: 'Grave a apresentação (com autorização) pra assistir de novo. Segunda assistência você vê o dobro.',
  },

  {
    id: 6,
    title: 'Convide 3 pessoas',
    rewardXP: 150,
    body: `**Convidar destrava o medo.**

O primeiro convite é o mais difícil. O terceiro já começa a parecer natural. Por isso a meta do FIR é **3 convites** — pra você atravessar a barreira mental.

### Como escolher os 3

- **1 quente:** alguém que você tem certeza que vai topar ouvir (família ou melhor amigo).
- **1 morno:** alguém que você não fala há uns meses mas tem boa relação.
- **1 "medo":** alguém que você tá adiando — aquele nome que você sempre pulou na lista.

Os 3 juntos te fazem aprender o máximo.

### Use o script do Passo 7 da Jornada

Não invente. Use o script "direto" ou "ponte" que a Jornada ensinou. Objetivo é **marcar horário**, não explicar o negócio.`,
    checklist: [
      'Convidei 1 pessoa quente',
      'Convidei 1 pessoa morna',
      'Convidei 1 pessoa "medo"',
      'Registrei cada resposta no Prospector',
      'Marquei pelo menos 1 apresentação',
    ],
    tip: 'Mande áudio no WhatsApp — o tom transmite entusiasmo que texto não transmite. E áudio cria compromisso: você não cancela depois.',
  },

  {
    id: 7,
    title: 'Participe de uma reunião online',
    rewardXP: 50,
    body: `**Reunião de time é onde a energia acontece.**

Semana sem reunião de time é como academia sem espelho — você treina, mas não vê a diferença. A reunião é onde você:

- Ouve depoimento real de quem tá rendendo
- Aprende uma ferramenta nova do mês
- Se reconecta com o propósito depois da semana desgastante
- Descobre eventos, turmas e lançamentos que impactam sua rede

### O que levar

- Caderno (digital ou papel)
- Lista de dúvidas acumuladas na semana
- 1 pergunta pra fazer (mesmo que pareça boba)

Participe com câmera aberta sempre que possível. Quem fica de câmera fechada desaparece.`,
    checklist: [
      'Descobri o dia e hora da próxima reunião',
      'Bloqueei na agenda',
      'Participei do início ao fim',
      'Fiz pelo menos 1 pergunta',
      'Anotei 1 ensinamento pra aplicar na semana',
    ],
    tip: 'Se a reunião do seu time tá fraca, peça ao upline o link de uma reunião "cross" (de outro time da empresa). Energia diferente.',
  },

  {
    id: 8,
    title: 'Complete a avaliação de scout',
    rewardXP: 100,
    body: `**Scout é o raio-x do seu começo.**

Scout é uma autoavaliação de 10 eixos — do quanto você tá dando em cada dimensão do negócio. Não é nota — é **espelho**. Serve pra você e pro seu upline saberem onde acelerar.

### Os 10 eixos

1. **Clareza de sonho** (passo 1)
2. **Tamanho da lista** (passo 2)
3. **Domínio do produto** (passo 4)
4. **Domínio da história** (passo 3)
5. **Frequência de prospecção** (passo 6)
6. **Taxa de agendamento** (passo 7)
7. **Qualidade de apresentação** (passo 8)
8. **Postura no fechamento** (passo 9)
9. **Consistência de follow-up** (passo 10)
10. **Capacidade de duplicação** (passo 11)

Você se dá de 0 a 10 em cada. Seja honesto. O time pega essa régua e usa pro próximo 1x1.

### Após o scout

O upline monta com você um plano de 30 dias focado nos **2 eixos mais baixos**. Foco em ponto fraco acelera mais do que reforço em ponto forte.`,
    checklist: [
      'Avaliei os 10 eixos de 0 a 10',
      'Fui honesto nas notas baixas',
      'Identifiquei meus 2 eixos prioritários',
      'Agendei 1x1 com meu upline pra montar plano de 30 dias',
      'Registrei o scout no perfil',
    ],
    tip: 'Refaça o scout a cada 30 dias. Ver a evolução dos números motiva mais que qualquer discurso.',
  },
];
