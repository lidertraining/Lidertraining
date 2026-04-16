-- ============================================================
-- LiderTraining — Seed de conteúdo estático
-- ============================================================
-- Espelha as constantes do HTML original (linhas 171–244 do protótipo).
-- ============================================================

-- Journey Steps (11 passos, index 0–10)
insert into journey_steps (id, name, icon, color, description) values
  (0, 'Defina seu Sonho', 'favorite', 'am', 'Por que você está aqui?'),
  (1, 'Monte sua Lista', 'list', 'am', 'Pessoas que você conhece'),
  (2, 'Sua História', 'auto_stories', 'am', 'Conecte com emoção'),
  (3, 'Vire Produto', 'spa', 'am', 'Use o que vende'),
  (4, 'Aprenda a Contar', 'psychology', 'am', 'Storytelling de impacto'),
  (5, 'Prospecção', 'person_search', 'am', 'Como abordar'),
  (6, 'Convite', 'mail', 'am', 'Chame para conhecer'),
  (7, 'Apresentação', 'co_present', 'am', '4 formas de mostrar'),
  (8, 'Fechamento', 'handshake', 'gd', 'As 3 Leis'),
  (9, 'Acompanhamento', 'schedule', 'em', 'Follow-up eficiente'),
  (10, 'Duplicação', 'group_add', 'em', 'Ensine quem entrou');

-- Objections (objeções + respostas)
insert into objections (objection, response, order_idx) values
  ('Não tenho dinheiro', 'Por isso mesmo! Quando começamos, eu também não tinha. Justamente essa falta foi o que me fez entrar. Qual seria um valor que você considera investir no seu futuro?', 1),
  ('Isso é pirâmide?', 'Entendo a preocupação. Pirâmides são ilegais justamente porque não há produto real. A [empresa] tem [X anos], vende produtos consumidos por milhões. Você ganha comercializando, não indicando pessoas.', 2),
  ('Não tenho tempo', 'Entendo perfeitamente. Por isso eu comecei no meu tempo vago. 1 ou 2 horas por dia já me trouxeram resultados. Quanto tempo você consegue hoje?', 3),
  ('Não gosto de vender', 'Nós não vendemos: nós indicamos o que já usamos e gostamos. Quando você indica um filme pra um amigo, você está "vendendo"?', 4),
  ('Preciso pensar', 'Claro! Pensar é importante. O que exatamente precisa ser pensado? Posso ajudar a esclarecer agora para você tomar a melhor decisão.', 5);

-- Icebreakers
insert into icebreakers (text, order_idx) values
  ('Eu acabei de descobrir uma coisa que me ajudou a mudar minha situação financeira. Topa conhecer?', 1),
  ('Lembrei de você agora. Você está buscando renda extra ou está satisfeito com a atual?', 2),
  ('Oi! Posso compartilhar uma ideia de negócio com você em 15 minutos?', 3),
  ('Você já pensou em ter uma renda extra sem largar seu trabalho?', 4),
  ('Estou em um projeto muito bom e você me veio em mente. Posso te mostrar?', 5),
  ('Ei, que bom falar com você! Tenho algo que pode interessar. Tem 20 minutos?', 6),
  ('Precisava da sua opinião sobre algo. Posso te mostrar?', 7),
  ('Vi que você sempre foi empreendedor. Posso te apresentar uma oportunidade?', 8);

-- Closing Laws (3 Leis do Fechamento)
insert into closing_laws (name, description, icon, example, order_idx) values
  ('Lei da Pergunta', 'Quem pergunta, conduz. Termine sempre com uma pergunta que leve ao SIM.', 'quiz',
   'Você prefere começar com o kit A ou com o kit B?', 1),
  ('Lei da Perspectiva', 'Ajude a pessoa a enxergar o resultado futuro. Faça o sonho virar imagem.', 'visibility',
   'Imagine sua vida daqui 12 meses com essa renda extra pagando as contas.', 2),
  ('Lei da Urgência', 'Mostre o custo de não decidir agora. Tempo é a commodity mais cara.', 'timer',
   'A promoção termina sexta-feira. Vamos garantir seu lugar hoje?', 3);

-- Closing Scripts (templates de fechamento)
insert into closing_scripts (name, template, order_idx) values
  ('Direto',
   'Você gostou do que viu? Então vamos dar o primeiro passo agora. Me envia sua melhor foto pra gente criar seu cadastro.',
   1),
  ('Consultivo',
   'Com base no que você me contou, vejo que [dor identificada]. Nosso plano [benefício] resolve exatamente isso. Você prefere começar com o kit básico ou com o kit premium?',
   2);

-- Audios
insert into audios (id, title, duration_seconds, order_idx) values
  ('a1', 'Boas-vindas à LiderTraining', 420, 1),
  ('a2', 'Fundamentos do Marketing de Rede', 780, 2),
  ('a3', 'Mindset de Consultor Elite', 540, 3),
  ('a4', 'Lista de Contatos: Como Montar', 360, 4),
  ('a5', 'Convite Poderoso em 30 segundos', 480, 5),
  ('a6', 'Apresentação Efetiva', 900, 6),
  ('a7', 'Fechamento sem Pressão', 600, 7),
  ('a8', 'Liderança e Duplicação', 720, 8);

-- Golden Rules (4 regras de ouro)
insert into golden_rules (rule, order_idx) values
  ('Seja produto do produto', 1),
  ('Duplique o que funciona', 2),
  ('Acompanhe sempre sua equipe', 3),
  ('Mantenha simples para qualquer um copiar', 4);

-- Plano 1x1 (8 etapas)
insert into one_on_one_plan (step, order_idx) values
  ('Quebra-gelo e rapport', 1),
  ('Entenda o sonho da pessoa', 2),
  ('Apresente sua história', 3),
  ('Mostre a oportunidade', 4),
  ('Apresente o plano de compensação', 5),
  ('Antecipe objeções', 6),
  ('Faça o fechamento', 7),
  ('Marque o acompanhamento', 8);

-- FIR Steps (8 etapas de First Introduction Reality)
insert into fir_steps (id, title, reward_xp, order_idx) values
  (1, 'Leia o Manual do Consultor', 50, 1),
  (2, 'Assista ao vídeo de boas-vindas', 50, 2),
  (3, 'Monte sua lista inicial (50 nomes)', 100, 3),
  (4, 'Faça seu primeiro pedido pessoal', 150, 4),
  (5, 'Agende sua primeira apresentação', 100, 5),
  (6, 'Convide 3 pessoas', 150, 6),
  (7, 'Participe de uma reunião online', 50, 7),
  (8, 'Complete a avaliação de scout', 100, 8);

-- Presentation Formats (4 formas de apresentar)
insert into presentation_formats (format, order_idx) values
  ('Presencial — 1 a 1', 1),
  ('Online — vídeo chamada', 2),
  ('Vídeo gravado', 3),
  ('Evento em grupo', 4);

-- Missions seed (4 exemplos iniciais)
insert into missions (id, name, description, type, target, reward_xp, duration_seconds, requirements) values
  ('m1', 'Sprint de Convites', 'Faça 5 convites em 6 horas', 'flash', 5, 100, 21600,
   '{"event":"add_lead"}'::jsonb),
  ('m2', 'Construtor de Rede', 'Adicione 10 contatos na semana', 'weekly', 10, 200, null,
   '{"event":"add_lead"}'::jsonb),
  ('m3', 'Streak de Fogo', 'Mantenha 15 dias de streak', 'achievement', 15, 500, null,
   '{"event":"streak"}'::jsonb),
  ('m4', 'Fechador Elite', 'Feche 3 vendas este mês', 'achievement', 3, 300, null,
   '{"event":"close_lead"}'::jsonb);
