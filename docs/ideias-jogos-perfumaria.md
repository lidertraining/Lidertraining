# 🎮 Ideias de Jogos de Perfumaria — LiderTraining

Banco de ideias de jogos online sobre perfumaria para o site, pensados para o ecossistema
que já existe (Arena, XP/badges/ligas, Academia 4P, Simulador de Vendas, Jornada).
Todos white-label: falam de perfumaria em geral, nunca de marcas.

---

## Critérios usados

- **Serve ao negócio:** cada jogo treina algo que o consultor usa em campo (conhecer produto, recomendar, contornar objeção, fechar venda).
- **Encaixa no que existe:** XP, badges e ligas já estão prontos — os jogos plugam nesse sistema em vez de criar outro.
- **Simples de construir:** quase tudo é quiz/card/drag-and-drop em React, sem física nem canvas complexo.
- **Sessões curtas:** 2 a 5 minutos por partida, formato mobile-first.

---

## Nível 1 — Rápidos de construir (quiz e cartas)

### 1. Pirâmide Olfativa (drag-and-drop)
O jogador recebe notas embaralhadas (bergamota, jasmim, âmbar, sândalo…) e precisa
arrastá-las para o andar certo da pirâmide: **saída, coração ou fundo**. Contra o relógio.
- **Treina:** vocabulário técnico básico que dá autoridade na hora de vender.
- **Mecânica:** 3 zonas de drop, 9–12 cartas por rodada, streak de acertos multiplica XP.
- **Esforço:** baixo. É o candidato ideal para o primeiro jogo.

### 2. Detetive das Famílias Olfativas
Aparece a descrição de um perfume ("notas cítricas vibrantes com fundo amadeirado…")
e 4 opções: Amadeirado, Oriental, Floral, Cítrico, Fougère, Chipre. Modo sobrevivência:
errou, acabou.
- **Treina:** classificar perfume rápido — habilidade central para recomendar.
- **Mecânica:** quiz de sobrevivência com ranking semanal na liga.

### 3. Verdade ou Mito da Perfumaria
Cartas de afirmação ("Perfume dura mais na pele hidratada", "Esfregar os pulsos fixa
o perfume") e o jogador desliza para ✓ verdade ou ✗ mito, estilo swipe.
- **Treina:** desmontar mitos que clientes repetem — vira argumento de venda.
- **Mecânica:** swipe deck, 10 cartas por rodada, explicação curta após cada resposta
  (é aqui que o aprendizado acontece).

### 4. Batalha de Concentrações
Ordenar do mais fraco ao mais forte: Eau Fraîche → Colônia → EDT → EDP → Parfum.
Variação: dado um cliente ("quer perfume pro trabalho, discreto, dia todo"), escolher
a concentração certa.
- **Treina:** a pergunta mais comum do cliente ("qual dura mais?").
- **Mecânica:** ordenação por arrastar + rodada de casos.

---

## Nível 2 — Jogos de recomendação (o coração do negócio)

### 5. Perfumista Pessoal (o jogo-carro-chefe)
Aparece um **cliente fictício com perfil**: idade, ocasião (trabalho, encontro, festa),
clima, personalidade, orçamento. O jogador monta a recomendação: família olfativa +
concentração + argumento de venda (escolhe entre 3 frases). O jogo pontua as 3 decisões.
- **Treina:** exatamente o que o consultor faz na vida real.
- **Mecânica:** gerador de clientes com atributos combinados (dezenas de perfis com
  pouco conteúdo), rubrica de pontuação por decisão, feedback explicando a escolha ideal.
- **Integração:** pode alimentar o Simulador de Vendas existente — o cliente do jogo
  vira o cliente da simulação de conversa.

### 6. Balcão Virtual (gestão de fila)
Estilo "Papa's Pizzeria": clientes chegam ao balcão com pedidos ("algo doce pra noite",
"presente pro meu pai"), e o jogador precisa atender rápido escolhendo o frasco certo
da prateleira. Erros deixam o cliente ir embora; acertos rendem gorjeta (XP).
- **Treina:** velocidade de associação perfil → produto, sob pressão leve.
- **Mecânica:** fila com timer, prateleira de 8–12 produtos genéricos, dificuldade
  progressiva (mais clientes, pedidos mais vagos).
- **Esforço:** médio-alto, mas é o de maior potencial de engajamento/retenção.

### 7. Duelo de Recomendação (PvP assíncrono)
Dois consultores recebem o **mesmo cliente fictício** e submetem sua recomendação +
argumento. Um terceiro consultor (ou votação da equipe) escolhe a melhor. Vencedor
leva XP e sobe na liga.
- **Treina:** argumentação de venda com feedback social real.
- **Mecânica:** assíncrono (nada de tempo real), usa as ligas existentes. O líder pode
  ver os duelos da equipe — vira ferramenta de coaching para o Painel do Líder.

---

## Nível 3 — Jogos de memória e maestria

### 8. Memória Olfativa (pares)
Jogo da memória clássico: parear a **nota** com sua **família/descrição**
(ex.: "vetiver" ↔ "raiz, terroso, fundo amadeirado").
- **Treina:** repertório de notas por repetição espaçada disfarçada de jogo.
- **Mecânica:** grid 4×4, pares por tema (semana das flores brancas, semana dos âmbares…).

### 9. Trilha do Nariz (progressão estilo Duolingo)
Uma trilha de 30 lições curtas de perfumaria — das famílias básicas até fixação,
projeção, camadas ("layering") e etiqueta de aplicação. Cada lição = 5 perguntas +
1 desafio prático de campo ("hoje, descreva um perfume pra alguém usando pirâmide").
- **Treina:** formação completa em perfumaria com o método 4P da Academia
  (Aprender → Praticar → Executar → Evoluir).
- **Mecânica:** reaproveita o padrão do desafio de 21 dias da Arena; streak diária,
  badge "Nariz de Ouro" ao completar.

### 10. Quebra-Objeção Relâmpago
Aparece uma objeção real de cliente ("tá caro", "perfume importado é melhor",
"não sinto o cheiro em mim depois de uma hora") e 3 respostas — só uma segue as boas
práticas de contorno. 10 segundos para escolher.
- **Treina:** reflexo de resposta a objeções, usando o conteúdo que já existe em
  `objections.ts`.
- **Mecânica:** quiz relâmpago; o banco de objeções do app já é a fonte de conteúdo.

---

## Como isso vira sistema (não jogos soltos)

1. **Tudo dá XP e conta pra liga** — os jogos entram no mesmo placar que missões da Arena.
2. **Jogo do dia:** um jogo em destaque por dia na home, com XP em dobro (traz o usuário de volta diariamente).
3. **Badges temáticas:** "Nariz de Ouro" (trilha completa), "Perfumista Pessoal" (50 clientes bem atendidos), "Caçador de Mitos" (100 cartas certas).
4. **Ponte pro campo (4P):** todo jogo termina com um mini-desafio real ("aplique isso com 1 cliente hoje") — o jogo ensina, o campo consolida.
5. **Dados pro líder:** o Painel do Líder mostra onde a equipe erra mais (ex.: todo mundo confunde Oriental com Amadeirado) → vira pauta de treinamento.

---

## Nível 4 — Jogos de negócio (perfumaria como empresa)

### 11. Maleta Perfeita (otimização de estoque)
O jogador tem um orçamento fictício e uma "maleta" com espaço limitado. Precisa montar
o mix ideal de produtos para uma semana de vendas, sabendo o perfil da região (bairro
jovem? público maduro? época de festas?). No fim da rodada, o jogo simula a semana e
mostra quanto ele lucrou — ou quanto dinheiro ficou parado em produto errado.
- **Treina:** pensar como empresário: capital de giro, mix de produto, giro de estoque.
- **Mecânica:** budget + slots + simulação simples de demanda por perfil. Puro estado
  em React, sem canvas.

### 12. Precifique Certo
Aparece um cenário ("cliente pede desconto de 20%", "kit com 3 itens", "revenda pra
outra consultora") e o jogador decide o preço. O jogo mostra na hora o **lucro real**
da decisão — incluindo o clássico erro de dar desconto que come toda a margem.
- **Treina:** matemática de margem, que é onde a maioria dos consultores quebra.
- **Mecânica:** slider de preço + cálculo instantâneo de margem com feedback visual
  (verde/vermelho). Educativo e chocante na medida certa.

### 13. Simulador de Meta do Mês
Mini-jogo de estratégia por turnos: 30 dias, cada dia o jogador escolhe 1 ação
(prospectar, fazer demonstração, cobrar pedido, pós-venda, descansar). Cada ação tem
custo de energia e retorno probabilístico. Objetivo: bater a meta sem "burnout".
- **Treina:** gestão de rotina e constância — o problema nº 1 do consultor iniciante.
- **Mecânica:** loop de turnos simples; conecta direto com o desafio de 21 dias da Arena.

---

## Nível 5 — Jogos sociais e de equipe

### 14. Caça ao Tesouro Olfativo (evento semanal)
Toda semana, o líder esconde 5 "frascos secretos" pelo app (dentro de lições, vídeos,
páginas de ferramenta). Cada frasco achado dá uma pista sobre um perfume misterioso.
Quem decifrar o perfume da semana (família + concentração + ocasião) ganha XP em dobro.
- **Treina:** exploração do próprio app — resolve o problema de features que ninguém descobre.
- **Mecânica:** easter eggs posicionados por config + um formulário de palpite.

### 15. Torneio Relâmpago da Equipe
Uma vez por semana, todos da equipe jogam **a mesma rodada** de 10 perguntas (mesmo
seed) e o resultado alimenta um pódio da equipe no Painel do Líder. O líder pode gravar
um áudio de 30s comentando o pódio (usa a Central de Áudios).
- **Treina:** cria ritual semanal de equipe; dá pauta pro líder sem esforço.
- **Mecânica:** reusa qualquer quiz existente com seed fixo + leaderboard filtrado por rede.

### 16. Passa ou Repassa da Perfumaria
Jogo em dupla assíncrono: o jogador responde 5 perguntas e pode "passar" 1 pergunta
difícil para o parceiro. Se o parceiro acertar, os dois pontuam em dobro.
- **Treina:** conteúdo + vínculo entre patrocinador e patrocinado (dupla natural).
- **Mecânica:** convite por link interno, turnos assíncronos, notificação quando o
  parceiro joga.

### 17. Monte a Vitrine (votação da comunidade)
Desafio criativo mensal: com um catálogo genérico de frascos, fundos e adereços, o
jogador monta uma vitrine virtual com tema ("Dia dos Namorados", "Verão"). A equipe
vota na melhor; as 3 mais votadas viram destaque na home.
- **Treina:** merchandising visual e senso estético de apresentação de produto.
- **Mecânica:** editor drag-and-drop simples + galeria com votos. Esforço médio,
  engajamento alto (as pessoas adoram mostrar criação).

---

## Nível 6 — Narrativa e imersão

### 18. A Jornada do Aprendiz de Perfumista (história interativa)
Visual novel curta: o jogador é aprendiz numa casa de perfumes fictícia e cada
capítulo termina com uma decisão que testa conhecimento ("o mestre pergunta qual
matéria-prima falta na fórmula…"). Decisões erradas não travam — geram consequências
na história e uma explicação.
- **Treina:** todo o conteúdo técnico embrulhado em narrativa, ideal pra quem não
  gosta de quiz seco.
- **Mecânica:** árvore de diálogo em JSON + telas de texto com o design editorial
  Amethyst Elite (combina perfeitamente com a estética serifada do app).

### 19. Cliente Misterioso (roleplay com IA)
Uma vez por dia, um "cliente misterioso" chega no chat: uma IA interpretando um perfil
difícil (apressado, desconfiado, super técnico). O jogador atende por texto. No fim,
recebe nota em 4 critérios: acolhimento, diagnóstico, recomendação, fechamento.
- **Treina:** a conversa de venda inteira, com pressão realista e feedback estruturado.
- **Mecânica:** edge function do Supabase chamando a API do Claude com rubrica de
  avaliação. É a evolução natural do Simulador de Vendas.

### 20. Perfume Tycoon (jogo idle de longo prazo)
O jogador administra sua "perfumaria dos sonhos" que cresce com ações reais no app:
completar lição = novo móvel na loja; bater meta da Arena = nova prateleira; trazer
patrocinado = contratar funcionário. A loja é a visualização do progresso real.
- **Treina:** nada diretamente — é a **cola de retenção** que dá significado visual a
  todo o resto.
- **Mecânica:** cena ilustrada em camadas (SVG/PNG) desbloqueadas por eventos que o
  app já emite (XP, badges, missões). Sem loop de jogo próprio = esforço menor do que parece.

---

## Nível 7 — Eventos sazonais (calendário comercial)

### 21. Maratona de Datas Quentes
Nas 2 semanas antes de cada data forte (Dia das Mães, Namorados, Natal), abre um
evento temático: perguntas e clientes fictícios todos voltados àquela ocasião
("presente pra sogra", "primeiro encontro"). Badge exclusiva por edição.
- **Treina:** preparação comercial na hora exata em que o consultor mais vende.
- **Mecânica:** reusa os jogos existentes trocando o banco de conteúdo por tema +
  cronômetro de evento. Custo marginal baixíssimo depois dos jogos base prontos.

### 22. Advento da Perfumaria (dezembro)
Calendário do advento: 24 portinhas, cada dia abre um micro-desafio de 1 minuto
(1 pergunta, 1 mito, 1 cliente relâmpago). Quem abrir 20+ portinhas ganha badge dourada.
- **Treina:** ritual diário no mês mais importante do ano.
- **Mecânica:** grid de portinhas com estado por dia; conteúdo reciclado dos outros jogos.

---

## Nível 8 — Modo Solo: desenvolvimento intelectual pessoal

Jogos para quem está sozinho e quer usar o tempo para **crescer intelectualmente** —
sem depender de equipe, líder ou outros jogadores. Conversa direto com o passo 0 da
Jornada (Mentalidade) e serve o consultor que joga à noite, no ônibus, no intervalo.

### 23. Ginásio Mental (treino diário do cérebro)
Sessão diária de 5 minutos com 3 exercícios rotativos: **memória** (sequência de
notas olfativas que cresce a cada rodada), **cálculo rápido** (margem, troco, desconto
de cabeça) e **lógica** (qual perfume não pertence ao grupo?). O jogo mede evolução
ao longo das semanas e mostra o gráfico de progresso pessoal.
- **Desenvolve:** memória de trabalho, agilidade mental, raciocínio lógico.
- **Mecânica:** 3 mini-jogos com dificuldade adaptativa (acertou muito → sobe nível).
  Estilo Lumosity, mas com conteúdo do universo do consultor.

### 24. Palavra do Dia (vocabulário e eloquência)
Todo dia, uma palavra nova de dois universos alternados: **perfumaria** (sillage,
acorde, olfativo) e **eloquência de vendas** (persuasão, rapport, escassez). O jogador
lê a definição, vê 2 exemplos de uso e completa 1 desafio: usar a palavra numa frase
de venda. No fim do mês, um quiz revisita as 30 palavras.
- **Desenvolve:** vocabulário, articulação verbal — quem fala melhor, vende melhor
  e lidera melhor.
- **Mecânica:** banco de palavras em JSON + input de frase + revisão espaçada mensal.
  Baratíssimo de construir.

### 25. Leitura Ativa (micro-resumos com teste)
Trechos curtos (2–3 parágrafos) de temas de crescimento: hábitos, finanças pessoais,
comunicação, psicologia da decisão. Depois de ler, o jogador responde 2 perguntas de
interpretação e escreve 1 frase: "como aplico isso amanhã?". As frases ficam salvas
num **diário de aprendizados** pessoal que ele pode reler.
- **Desenvolve:** compreensão de leitura, síntese, hábito de reflexão.
- **Mecânica:** conteúdo texto + quiz + campo livre salvo no perfil. Integra com o
  Sistema de Conhecimento (`conhecimentos`) que já existe.

### 26. Xadrez de Objeções (raciocínio estratégico solo)
Versão solo e profunda do Quebra-Objeção: uma conversa de venda em árvore, onde cada
resposta abre novos caminhos e o "cliente" reage 3–4 lances à frente. Como um puzzle
de xadrez: existe uma linha ótima, e o jogo mostra ao final o mapa completo da árvore
com a rota que o jogador percorreu vs. a rota ideal.
- **Desenvolve:** pensamento estratégico, antecipação de consequências, paciência.
- **Mecânica:** árvore de diálogo em JSON com pontuação por profundidade. Um puzzle
  novo por semana ("puzzle da semana") dura meses com pouco conteúdo.

### 27. Diário Guiado de Mentalidade (escrita reflexiva)
Não é bem um jogo — é um ritual noturno gamificado de 3 minutos: o app faz 1 pergunta
profunda por dia ("Qual foi o 'não' que mais te ensinou hoje?", "O que você faria se
não tivesse medo?"), o jogador escreve, e ganha streak + badge por constância. Depois
de 30 dias, o app monta uma retrospectiva com as próprias respostas do jogador.
- **Desenvolve:** autoconhecimento, inteligência emocional, clareza de pensamento —
  a base do passo Mentalidade da Jornada.
- **Mecânica:** 1 pergunta/dia de um banco de 90 + streak + retrospectiva automática.
  A retrospectiva do mês é um momento emocional fortíssimo de retenção.

### 28. Enigmas do Mestre Perfumista (puzzles de lógica)
Um enigma de lógica por semana, ambientado na perfumaria: charadas de dedução estilo
Einstein ("três clientes, três famílias olfativas, três ocasiões — quem comprou o
quê?"), problemas de sequência e cifras escondidas em rótulos. Dificuldade crescente
ao longo do mês.
- **Desenvolve:** raciocínio dedutivo puro, atenção a detalhes, persistência.
- **Mecânica:** grid de dedução interativo + banco de enigmas. Quem resolve sem dica
  ganha XP triplo; dicas custam XP.

### 29. Oratória no Espelho (prática de fala solo)
O app sorteia um tema ("explique por que perfume é presente, não gasto") e um limite
de tempo (60s). O jogador grava um áudio falando sozinho — como se treinasse no
espelho. A IA transcreve e devolve feedback gentil: palavras-muleta ("éééé", "tipo"),
ritmo, clareza, e 1 sugestão concreta. Ninguém mais ouve o áudio.
- **Desenvolve:** eloquência, confiança ao falar, autopercepção — treino privado e
  sem julgamento, perfeito pra quem tem vergonha de praticar com outras pessoas.
- **Mecânica:** gravação no browser + edge function com transcrição + análise via
  API do Claude. Aproveita a infraestrutura pensada pro Cliente Misterioso (nº 19).

### 30. Modo Foco Pomodoro com Recompensa
Timer de foco de 25 minutos pra estudar qualquer lição da Academia sem interrupção.
Se completar o ciclo sem sair do app, ganha XP bônus e "cristais de foco" que
desbloqueiam temas visuais exclusivos. Estatística pessoal: "você já somou X horas
de estudo focado".
- **Desenvolve:** capacidade de concentração profunda — o multiplicador de todo o resto.
- **Mecânica:** timer + detecção de visibilitychange + contador acumulado no perfil.
  Simples e cria hábito de estudo de verdade.

**Fio condutor do Modo Solo:** todos alimentam um painel pessoal de **Evolução
Intelectual** no perfil — memória, vocabulário, leitura, estratégia, escrita, oratória
e foco, cada um com sua barrinha crescendo. O jogador literalmente **vê o próprio
intelecto subir de nível**, mesmo sem ninguém por perto. Solidão vira tempo de
construção, e isso é mensagem poderosa pra retenção noturna.

---

## Recomendação de ordem de construção

| Fase | Jogos | Por quê |
|------|-------|---------|
| 1 | Pirâmide Olfativa + Verdade ou Mito | Baratos, validam o apetite por jogos |
| 2 | Perfumista Pessoal + Quebra-Objeção | Maior valor de negócio, reusa conteúdo existente |
| 3 | Trilha do Nariz | Transforma jogos soltos em formação contínua |
| 4 | Torneio Relâmpago + Maratona de Datas | Ritual de equipe + calendário comercial, reusando os jogos das fases 1–2 |
| 5 | Cliente Misterioso (IA) | Evolução do Simulador de Vendas, alto valor |
| 6 | Balcão Virtual, Duelo PvP, Perfume Tycoon | Apostas de engajamento de longo prazo |
