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

## Recomendação de ordem de construção

| Fase | Jogos | Por quê |
|------|-------|---------|
| 1 | Pirâmide Olfativa + Verdade ou Mito | Baratos, validam o apetite por jogos |
| 2 | Perfumista Pessoal + Quebra-Objeção | Maior valor de negócio, reusa conteúdo existente |
| 3 | Trilha do Nariz | Transforma jogos soltos em formação contínua |
| 4 | Balcão Virtual + Duelo PvP | Apostas de engajamento, só depois de validar as fases 1–3 |
