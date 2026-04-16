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

  { id: 2, name: 'Sua História', icon: 'auto_stories', color: 'am', description: 'Conecte com emoção' },
  { id: 3, name: 'Vire Produto', icon: 'spa', color: 'am', description: 'Use o que vende' },
  { id: 4, name: 'Aprenda a Contar', icon: 'psychology', color: 'am', description: 'Storytelling de impacto' },
  { id: 5, name: 'Prospecção', icon: 'person_search', color: 'am', description: 'Como abordar' },
  { id: 6, name: 'Convite', icon: 'mail', color: 'am', description: 'Chame para conhecer' },
  { id: 7, name: 'Apresentação', icon: 'co_present', color: 'am', description: '4 formas de mostrar' },
  { id: 8, name: 'Fechamento', icon: 'handshake', color: 'gd', description: 'As 3 Leis' },
  { id: 9, name: 'Acompanhamento', icon: 'schedule', color: 'em', description: 'Follow-up eficiente' },
  { id: 10, name: 'Duplicação', icon: 'group_add', color: 'em', description: 'Ensine quem entrou' },
];
