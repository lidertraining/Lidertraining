-- ============================================================
-- LiderTraining — Seed Inicial de Conhecimentos
-- ============================================================
-- 13 conhecimentos pra preencher o sistema de aprendizagem.
-- Cobre Mentalidade · Sonhos · Lista · Convite · Apresentação ·
-- Fechamento + categoria audio_semana e microlearning.
--
-- IDEMPOTENTE: cada insert verifica se titulo já existe antes
-- de inserir. Pode rodar quantas vezes quiser sem duplicar.
-- ============================================================

-- ------------------------------------------------------------
-- CONHECIMENTOS — TIPO REPORT (texto markdown)
-- ------------------------------------------------------------

-- Passo 0 (Mentalidade)
insert into conhecimentos (tipo, titulo, descricao, categoria, passo_jornada, obrigatorio, xp_reward, conteudo_texto, ordem, ativo)
select 'report', '5 crenças que separam top performers de medianos', 'O ponto cego mental que trava 80% dos consultores', 'formacao', 0, true, 30,
$txt$# 5 crenças que separam top performers de medianos

Você não é o que pensa que é. Você é **o que repete pra si mesmo todo dia**. Os 5 padrões abaixo são a diferença prática entre quem fatura R$ 3K/mês e quem fatura R$ 30K.

---

## 1. "Atividade resolve quase tudo"

Os medianos buscam a estratégia perfeita antes de começar. Os tops fazem 100 ligações erradas pra descobrir o que funciona. **Quantidade gera dado, dado gera estratégia, estratégia gera resultado.** Nessa ordem.

## 2. "Resposta dura é informação, não rejeição"

Quem ouve "não" e desiste leu o "não" como julgamento pessoal. Quem ouve "não" e pergunta "por quê?" leu como dado de mercado. **A objeção é o presente que o lead te dá.**

## 3. "Eu sou meu primeiro cliente"

Se você não consome o que vende, sua autoridade é teórica. **Quem não usa o produto não tem história, e história é o que vende.**

## 4. "O upline é meu sócio, não meu chefe"

Mediano espera o líder mandar. Top performer leva pro líder o problema E 3 hipóteses de solução. **Quem só recebe ordem nunca vira líder.**

## 5. "Os números falam por mim"

Ego mediano discute o discurso. Ego top performer mostra a planilha. **Resultado é a única retórica que sobrevive a qualquer discussão.**

---

## Como aplicar essa semana

- Escreve as 5 crenças num post-it e cola no espelho.
- Toda vez que pegar uma na atitude oposta, anota no caderno.
- Toda noite olha quantos posts-its registrou.
- No domingo vê padrão e ajusta.

**Disciplina diária > insight ocasional.**
$txt$,
1, true
where not exists (select 1 from conhecimentos where titulo = '5 crenças que separam top performers de medianos');

-- Passo 1 (Sonhos)
insert into conhecimentos (tipo, titulo, descricao, categoria, passo_jornada, obrigatorio, xp_reward, conteudo_texto, ordem, ativo)
select 'report', 'Como criar sonhos VISUAIS que te puxam', 'Por que sonho abstrato não move ninguém — e como tornar concreto', 'formacao', 1, false, 25,
$txt$# Como criar sonhos VISUAIS que te puxam

"Quero ser rico" não move ninguém. Cérebro não opera com abstração — opera com **imagem, cheiro, som, sensação corporal**. Quem só fala "quero ganhar mais" segue na mesma. Quem visualiza "vou pegar minha mãe e levar pra Disney em julho de 2027, ela vai chorar quando ver o castelo" age diferente.

---

## A regra dos 3 sentidos

Pra um sonho funcionar como combustível, ele precisa ter:

1. **Visual** — o que você está vendo? (cor, lugar, pessoas, objeto)
2. **Sensorial** — o que está sentindo? (textura, temperatura, postura corporal)
3. **Emocional** — qual a emoção exata? (gratidão? orgulho? alívio?)

Se você não consegue descrever os 3, o sonho ainda é vago demais.

## Exemplo concreto

❌ **Vago:** "Quero comprar uma casa"

✅ **Visual:** "Casa de 4 quartos no condomínio X, varanda virada pro nascente, sala com pé-direito alto, cozinha americana com bancada de mármore preto"

✅ **Sensorial:** "Sentado na varanda às 7h, café fumegante na mão, brisa fria, cheiro de jasmim do quintal"

✅ **Emocional:** "Orgulho calmo. Não é euforia, é 'cheguei'. Olho minha família dormindo e penso: foi por isso"

---

## Atividade da semana

1. Escolhe 1 sonho central
2. Escreve os 3 sentidos em detalhe (visual, sensorial, emocional)
3. Cola onde você vê 5x por dia: bloqueio do celular, espelho, geladeira

**Sonho que não tem rosto, vira lembrete vazio. Sonho que tem cheiro, vira plano.**
$txt$,
1, true
where not exists (select 1 from conhecimentos where titulo = 'Como criar sonhos VISUAIS que te puxam');

-- Passo 5 (Lista)
insert into conhecimentos (tipo, titulo, descricao, categoria, passo_jornada, obrigatorio, xp_reward, conteudo_texto, ordem, ativo)
select 'report', 'A Lista Viva: 100+ pessoas em 30 minutos', 'O método que esgota sua memória sem deixar nome importante de fora', 'formacao', 5, true, 40,
$txt$# A Lista Viva: 100+ pessoas em 30 minutos

A maior parte dos consultores começa com 20 nomes — os óbvios — e trava. **A diferença entre 20 e 200 não é memória, é método.** Sua memória só responde a perguntas certas.

---

## Os 12 gatilhos da Lista Viva

Pra cada gatilho abaixo, escreve TODOS os nomes que vierem em 2 minutos. Sem filtrar.

1. **Família** (pais, tios, primos, cunhados, sobrinhos)
2. **Amigos próximos** (com quem você sai/zaps frequente)
3. **Amigos antigos** (escola, faculdade, cursos)
4. **Vizinhos** (prédio, condomínio, rua)
5. **Trabalho atual** (colegas, chefes, clientes)
6. **Trabalhos antigos** (todos os colegas dos últimos 10 anos)
7. **Igreja / comunidade** (pessoas que você vê toda semana)
8. **Atividades** (academia, futebol, jiu-jitsu, curso de inglês)
9. **Profissionais** (médicos, dentistas, cabeleireiro, mecânico, manicure, professor de filhos)
10. **Pais de amigos dos seus filhos**
11. **Conhecidos de redes sociais** (quem comenta seus posts, quem você comenta)
12. **Pessoas pelo telefone** (rola a agenda inteira do celular)

---

## Regras anti-bloqueio

- ❌ **NÃO PRÉ-QUALIFIQUE.** "Ah, ele já tem dinheiro" / "Ela nunca compraria" / "Não vai querer". Você não é vidente. Anota.
- ❌ **NÃO ORDENE AINDA.** Aqui é só puxar nomes. Qualificação vem depois.
- ✅ **CHEGOU EM 100? CONTINUA.** O cérebro tem mais. Pergunta: "quem mais conhece o nome X?"
- ✅ **ROLA O FACEBOOK E INSTAGRAM** vendo amigos — sempre destrava 30 nomes.

---

## Depois da lista

Quando tiver 100+, classifica em 3 colunas:

- 🔥 **Quente** (fala todo dia/semana, confia em você)
- 🌡 **Morno** (fala às vezes, conhecido)
- ❄ **Frio** (mal-conhecido, mas tem o telefone)

**Importa que tenha lista. Frio também converte com método certo.**
$txt$,
1, true
where not exists (select 1 from conhecimentos where titulo = 'A Lista Viva: 100+ pessoas em 30 minutos');

-- Passo 7 (Apresentação)
insert into conhecimentos (tipo, titulo, descricao, categoria, passo_jornada, obrigatorio, xp_reward, conteudo_texto, ordem, ativo)
select 'report', 'Apresentação 1x1: estrutura PROVA-EMOÇÃO-CHAMADO', 'A receita simples que vira "só vou dar uma olhada" em "quando começo?"', 'formacao', 7, true, 35,
$txt$# Apresentação 1x1: estrutura PROVA · EMOÇÃO · CHAMADO

Apresentação ruim: você fala 40 minutos, lead acena com cabeça e some. Apresentação boa: 25 minutos, e o lead pergunta "como entro?" antes de você terminar. Não é carisma — é **estrutura**.

---

## A estrutura em 3 blocos

### 🪨 BLOCO 1 — PROVA (8-10 min)

Mostra que **funciona**. Não na teoria, na prática.

- Quem é a empresa, há quanto tempo, faturamento (números grandes geram autoridade)
- 2-3 histórias de pessoas REAIS que mudaram de vida (com nome, foto, antes/depois)
- 1 dado de mercado que prova que o nicho cresce

**Erro comum:** despejar 200 fatos. **Faz o oposto:** menos é mais.

### 🔥 BLOCO 2 — EMOÇÃO (10-12 min)

Conecta o sonho do lead com o caminho.

- Pergunta: "se grana não fosse problema, o que você faria amanhã?"
- Escuta — anota mental.
- Conecta a resposta dele com 2-3 benefícios do plano.
- Se ele falou "viajar com a esposa", você fala da pessoa do time que viaja todo trimestre.
- Se ele falou "tirar a mãe da casa apertada", você fala de quem comprou casa pros pais.

**Você não está vendendo um plano. Você está vendendo o sonho dele, com o plano como ferramenta.**

### 🎯 BLOCO 3 — CHAMADO (3-5 min)

Pede a decisão. Sem rodeio. Sem "pensa aí, qualquer coisa me chama".

- "Eu te chamei aqui porque vejo potencial. O que falta pra começar amanhã?"
- Espera a resposta (3 segundos de silêncio são poderosos).
- Se for objeção real, trata com respeito. Se for desculpa, suaviza e pergunta de novo.

**Ofereça caminho, não opção.** "Você prefere começar pelo plano A ou plano B?" — não "você quer começar?"

---

## Regra de ouro

**A apresentação não vende. Quem vende é a confiança que o lead tem em VOCÊ.** Por isso prova vem antes de emoção: prova compra a atenção, emoção compra o coração, chamado compra a decisão.

Se a confiança não está construída, nenhum desses blocos importa.
$txt$,
1, true
where not exists (select 1 from conhecimentos where titulo = 'Apresentação 1x1: estrutura PROVA-EMOÇÃO-CHAMADO');

-- Microlearning (sem passo)
insert into conhecimentos (tipo, titulo, descricao, categoria, passo_jornada, obrigatorio, xp_reward, conteudo_texto, ordem, ativo)
select 'report', '5 minutos: O Princípio dos 5 Patrocínios Diretos', 'Por que ter 5 ativos na sua linha direta muda tudo', 'microlearning', null, false, 15,
$txt$# 5 minutos: O Princípio dos 5 Patrocínios Diretos

A maioria pensa em rede como pirâmide larga. **A elite pensa como árvore com 5 ramos profundos.**

---

## Por que 5?

- Menos que 5: você fica com toda dependência em 1-2 pessoas. Se eles param, você cai.
- Mais que 10: você não consegue dar atenção real pra ninguém. Vira gestão de gente.
- **Entre 5-7: o sweet spot.** Quantidade pra criar segurança. Qualidade pra criar profundidade.

## A fórmula

**5 patrocínios diretos × 3 níveis de profundidade = 60 pessoas potenciais sob você**

(supondo que cada um patrocina 3, e cada um desses patrocina 4 — distribuição realista)

## Como aplicar

- Conta quantos diretos ativos você tem hoje
- Se < 5: foco da próxima semana é fechar até completar
- Se ≥ 5: foco vira aprofundar — ajudar cada um a fechar mais 3

**Largura sem profundidade é igual a parede de areia.**
$txt$,
1, true
where not exists (select 1 from conhecimentos where titulo = '5 minutos: O Princípio dos 5 Patrocínios Diretos');

-- ------------------------------------------------------------
-- CONHECIMENTOS — TIPO QUIZ
-- ------------------------------------------------------------

-- Quiz Mentalidade (Passo 0)
with novo_quiz as (
  insert into conhecimentos (tipo, titulo, descricao, categoria, passo_jornada, obrigatorio, xp_reward, ordem, ativo)
  select 'quiz', 'Você tem mentalidade de elite? — 5 perguntas', 'Teste rápido pra calibrar onde você está mentalmente hoje', 'formacao', 0, false, 50, 2, true
  where not exists (select 1 from conhecimentos where titulo = 'Você tem mentalidade de elite? — 5 perguntas')
  returning id
)
insert into quiz_perguntas (conhecimento_id, pergunta, alternativas, resposta_correta, explicacao, ordem)
select id, p.pergunta, p.alternativas, p.resposta, p.explicacao, p.ordem
from novo_quiz, (values
  ('Quando ouve um "não" de um lead, o que você faz primeiro?',
    '["Penso que ele não entendeu","Pergunto educadamente o motivo","Sigo pro próximo nome","Fico chateado por dentro"]'::jsonb,
    1::smallint,
    'Top performer trata "não" como dado, não como rejeição. A pergunta sobre o motivo desbloqueia 30% das vendas perdidas.',
    1::smallint),
  ('Você consome o produto que vende?',
    '["Não, é caro pra mim","Comprei uma vez, parou","Uso ocasionalmente","Sou meu primeiro cliente, mensal"]'::jsonb,
    3::smallint,
    'História pessoal vende mais que script perfeito. Quem não usa, conta teoria. Quem usa, conta experiência.',
    2::smallint),
  ('Quantas atividades de prospecção você fez ontem?',
    '["0-2","3-5","6-10","Mais de 10"]'::jsonb,
    3::smallint,
    'A maioria que fatura alto faz 10+/dia. Atividade não é tudo, mas sem ela nada acontece.',
    3::smallint),
  ('Quando seu upline pede um relatório, você...',
    '["Tento adiar pra depois","Mando a planilha pura","Mando planilha + 2 hipóteses do que dá pra melhorar","Espero ele cobrar"]'::jsonb,
    2::smallint,
    'Líder em formação leva problema E hipótese. Quem só executa nunca vira líder.',
    4::smallint),
  ('Como você reage quando perde uma venda grande?',
    '["Fico triste o dia inteiro","Procuro culpa em mim","Anoto o aprendizado e parto pro próximo","Acho que o lead não tinha entendido"]'::jsonb,
    2::smallint,
    'Aprendizado > emoção. Top performer extrai dado da derrota. Mediano carrega o peso.',
    5::smallint)
) as p(pergunta, alternativas, resposta, explicacao, ordem);

-- Quiz Fechamento (Passo 8)
with novo_quiz as (
  insert into conhecimentos (tipo, titulo, descricao, categoria, passo_jornada, obrigatorio, xp_reward, ordem, ativo)
  select 'quiz', 'Você sabe identificar o momento certo de fechar?', 'Sinais que dizem "feche agora" — e armadilhas que parecem prontidão mas não são', 'formacao', 8, true, 50, 1, true
  where not exists (select 1 from conhecimentos where titulo = 'Você sabe identificar o momento certo de fechar?')
  returning id
)
insert into quiz_perguntas (conhecimento_id, pergunta, alternativas, resposta_correta, explicacao, ordem)
select id, p.pergunta, p.alternativas, p.resposta, p.explicacao, p.ordem
from novo_quiz, (values
  ('Lead pergunta: "E como funciona o pagamento?". Isso é sinal de:',
    '["Curiosidade vaga","Objeção disfarçada","Sinal de fechamento — está pensando em comprar","Despedida educada"]'::jsonb,
    2::smallint,
    'Pergunta operacional ("como funciona X?") é um dos 5 sinais clássicos de prontidão. Quem não tem interesse não pergunta detalhe.',
    1::smallint),
  ('Após apresentar, lead diz "vou pensar". O que fazer?',
    '["Acatar e esperar","Pressionar pra decidir agora","Perguntar: pensar no quê especificamente?","Mandar mensagem todo dia"]'::jsonb,
    2::smallint,
    '"Vou pensar" 90% das vezes é desculpa pra não dizer "não" na cara. Pergunta certa transforma em objeção concreta — que dá pra tratar.',
    2::smallint),
  ('Sinal MAIS forte de prontidão pra fechar:',
    '["Lead elogia a apresentação","Lead pergunta sobre quanto tempo leva pra ver resultado","Lead conta uma história pessoal relacionada","Lead pergunta se pode chamar a esposa pra falar contigo"]'::jsonb,
    3::smallint,
    'Pedir pra envolver o cônjuge é praticamente "vou comprar, só preciso alinhar". Os outros são positivos mas não decisórios.',
    3::smallint),
  ('Lead diz "está caro". Primeira reação:',
    '["Dar desconto","Reforçar o valor","Perguntar: caro comparado a quê?","Mostrar o plano mais barato"]'::jsonb,
    2::smallint,
    '"Caro" sem contexto é vago. A pergunta esclarece se é orçamento real ou comparação errada com produto inferior.',
    4::smallint),
  ('Quanto tempo de silêncio depois do CHAMADO?',
    '["Nenhum, sigo falando","1-2 segundos","3-7 segundos","Mais de 10 segundos"]'::jsonb,
    2::smallint,
    'Silêncio depois do chamado é poder. Quem fala primeiro perde. 3-7s força o lead a se posicionar.',
    5::smallint)
) as p(pergunta, alternativas, resposta, explicacao, ordem);

-- Quiz Microlearning - Termos do MMN
with novo_quiz as (
  insert into conhecimentos (tipo, titulo, descricao, categoria, passo_jornada, obrigatorio, xp_reward, ordem, ativo)
  select 'quiz', 'Microlearning: Termos do MMN', 'Glossário básico — pra você falar a língua certa com upline e leads', 'microlearning', null, false, 30, 2, true
  where not exists (select 1 from conhecimentos where titulo = 'Microlearning: Termos do MMN')
  returning id
)
insert into quiz_perguntas (conhecimento_id, pergunta, alternativas, resposta_correta, explicacao, ordem)
select id, p.pergunta, p.alternativas, p.resposta, p.explicacao, p.ordem
from novo_quiz, (values
  ('O que é "downline"?',
    '["Sua linha direta de comando","Pessoas que você patrocinou (e quem elas patrocinaram)","Lista de leads frios","Plano de carreira"]'::jsonb,
    1::smallint,
    'Downline = sua rede pra baixo. Você é o upline deles, eles são sua downline.',
    1::smallint),
  ('Patrocinador é a pessoa que:',
    '["Vendeu o produto pra você","Te trouxe pra empresa","É seu mentor pago","Te paga comissão"]'::jsonb,
    1::smallint,
    'Patrocinador = quem te apresentou e cadastrou. Vira seu upline direto.',
    2::smallint),
  ('VIP costuma se referir a:',
    '["Cliente importante","Volume de pontos","Plano premium","Convidado especial"]'::jsonb,
    1::smallint,
    'VIP = Volume Indicado de Pontuação. É o critério de qualificação por volume.',
    3::smallint),
  ('"Profundidade" na rede significa:',
    '["Quantos diretos você tem","Quantos níveis abaixo de você existem","Tempo que você está na empresa","Faturamento mensal"]'::jsonb,
    1::smallint,
    'Profundidade = quantos níveis a sua rede tem. Largura = quantos diretos.',
    4::smallint)
) as p(pergunta, alternativas, resposta, explicacao, ordem);

-- ------------------------------------------------------------
-- CONHECIMENTOS — TIPO FLASHCARDS
-- ------------------------------------------------------------

-- Flashcards: Convite (Passo 6)
with novo_fc as (
  insert into conhecimentos (tipo, titulo, descricao, categoria, passo_jornada, obrigatorio, xp_reward, ordem, ativo)
  select 'flashcards', 'Os 8 ingredientes do convite perfeito', 'Memorize as peças e seu convite vira reflexo', 'formacao', 6, true, 40, 1, true
  where not exists (select 1 from conhecimentos where titulo = 'Os 8 ingredientes do convite perfeito')
  returning id
)
insert into flashcards (conhecimento_id, frente, verso, ordem)
select id, f.frente, f.verso, f.ordem
from novo_fc, (values
  ('Postura inicial', 'Confiante e BREVE. Quem fala muito no convite, espanta. 90 segundos basta.', 1::smallint),
  ('Curiosidade primeiro', 'Não vende no convite. Você gera 1 pergunta na cabeça do lead — só isso.', 2::smallint),
  ('Tempo definido', 'Sempre proponha hora específica: "terça às 19h" — não "qualquer dia".', 3::smallint),
  ('Local específico', 'Lugar concreto reduz ansiedade: "no Starbucks da Av Paulista" — não "lugar perto".', 4::smallint),
  ('Quem mais vai estar', 'Se for grupo, diga quantos. Se for 1x1, deixa claro que é só vocês.', 5::smallint),
  ('Pré-quadro', 'Anuncie o tipo: "vou te mostrar uma oportunidade que pode te interessar" (não "vou te apresentar um produto").', 6::smallint),
  ('Comprometimento', 'Termina com pergunta fechada: "posso contar com você?" — não "tenta aparecer".', 7::smallint),
  ('Confirmação no dia', 'Mensagem 4h antes confirmando. Sem isso, taxa de comparecimento cai 40%.', 8::smallint)
) as f(frente, verso, ordem);

-- Flashcards: Objeções clássicas (Passo 8)
with novo_fc as (
  insert into conhecimentos (tipo, titulo, descricao, categoria, passo_jornada, obrigatorio, xp_reward, ordem, ativo)
  select 'flashcards', 'Respostas-padrão pra 8 objeções clássicas', 'Decora as respostas e nunca mais é pego desprevenido', 'formacao', 8, true, 50, 2, true
  where not exists (select 1 from conhecimentos where titulo = 'Respostas-padrão pra 8 objeções clássicas')
  returning id
)
insert into flashcards (conhecimento_id, frente, verso, ordem)
select id, f.frente, f.verso, f.ordem
from novo_fc, (values
  ('"Não tenho tempo"',
    'Concordo, tempo é o ativo mais escasso. Por isso justamente queria te mostrar — esse modelo te dá tempo de volta. Quanto tempo você gasta hoje no que NÃO te leva pra onde você quer?',
    1::smallint),
  ('"Não tenho dinheiro"',
    'Entendo. Justamente por isso é importante a gente conversar. Você prefere que eu te mostre como começar com investimento mínimo, ou prefere primeiro entender se faz sentido pra você?',
    2::smallint),
  ('"Vou pensar"',
    'Claro. Pensar no quê especificamente? Pra eu te ajudar a esclarecer agora se for o caso.',
    3::smallint),
  ('"Não sou de vender"',
    'Você não vai vender. Você vai indicar coisas que você curte pra pessoas que você confia. Isso você já faz — quando recomenda restaurante.',
    4::smallint),
  ('"Já tentei MMN antes e não deu certo"',
    'Posso perguntar o que aconteceu? (escuta, valida, depois) — Entendo. O que mudou agora é [diferencial concreto]. Quer ver na prática?',
    5::smallint),
  ('"Minha esposa/marido não vai aprovar"',
    'Faz total sentido alinhar com quem é parceiro. Que tal eu te ajudar a apresentar pra ela/ele também? Junto fica mais fácil.',
    6::smallint),
  ('"Isso é pirâmide"',
    'Entendo a preocupação — pirâmide é ilegal e a gente também não é. Diferença simples: pirâmide ganha indicando, sem produto. Aqui ganha porque há produto vendido pro consumidor final. Posso te mostrar a documentação?',
    7::smallint),
  ('"Preciso pesquisar mais"',
    'Excelente, pessoa cuidadosa fecha melhor. O que você gostaria de pesquisar especificamente? Posso te indicar fontes confiáveis pra acelerar.',
    8::smallint)
) as f(frente, verso, ordem);

-- ------------------------------------------------------------
-- Mensagem de sucesso
-- ------------------------------------------------------------
do $$ begin
  raise notice '✅ Seed completo. Conhecimentos: %', (select count(*) from conhecimentos);
  raise notice '✅ Flashcards: %', (select count(*) from flashcards);
  raise notice '✅ Quiz perguntas: %', (select count(*) from quiz_perguntas);
end $$;
