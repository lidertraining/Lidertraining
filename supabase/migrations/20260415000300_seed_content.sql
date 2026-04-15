-- ============================================================
-- LiderTraining \u2014 Seed de conte\u00fado est\u00e1tico
-- ============================================================
-- Espelha as constantes do HTML original (linhas 171\u2013244 do prot\u00f3tipo).
-- ============================================================

-- Journey Steps (11 passos, index 0\u201310)
insert into journey_steps (id, name, icon, color, description) values
  (0, 'Defina seu Sonho', 'favorite', 'am', 'Por que voc\u00ea est\u00e1 aqui?'),
  (1, 'Monte sua Lista', 'list', 'am', 'Pessoas que voc\u00ea conhece'),
  (2, 'Sua Hist\u00f3ria', 'auto_stories', 'am', 'Conecte com emo\u00e7\u00e3o'),
  (3, 'Vire Produto', 'spa', 'am', 'Use o que vende'),
  (4, 'Aprenda a Contar', 'psychology', 'am', 'Storytelling de impacto'),
  (5, 'Prospec\u00e7\u00e3o', 'person_search', 'am', 'Como abordar'),
  (6, 'Convite', 'mail', 'am', 'Chame para conhecer'),
  (7, 'Apresenta\u00e7\u00e3o', 'co_present', 'am', '4 formas de mostrar'),
  (8, 'Fechamento', 'handshake', 'gd', 'As 3 Leis'),
  (9, 'Acompanhamento', 'schedule', 'em', 'Follow-up eficiente'),
  (10, 'Duplica\u00e7\u00e3o', 'group_add', 'em', 'Ensine quem entrou');

-- Objections (objeções + respostas)
insert into objections (objection, response, order_idx) values
  ('N\u00e3o tenho dinheiro', 'Por isso mesmo! Quando come\u00e7amos, eu tamb\u00e9m n\u00e3o tinha. Justamente essa falta foi o que me fez entrar. Qual seria um valor que voc\u00ea considera investir no seu futuro?', 1),
  ('Isso \u00e9 pir\u00e2mide?', 'Entendo a preocupa\u00e7\u00e3o. Pir\u00e2mides s\u00e3o ilegais justamente porque n\u00e3o h\u00e1 produto real. A [empresa] tem [X anos], vende produtos consumidos por milh\u00f5es. Voc\u00ea ganha comercializando, n\u00e3o indicando pessoas.', 2),
  ('N\u00e3o tenho tempo', 'Entendo perfeitamente. Por isso eu come\u00e7ei no meu tempo vago. 1 ou 2 horas por dia j\u00e1 me trouxeram resultados. Quanto tempo voc\u00ea consegue hoje?', 3),
  ('N\u00e3o gosto de vender', 'N\u00f3s n\u00e3o vendemos: n\u00f3s indicamos o que j\u00e1 usamos e gostamos. Quando voc\u00ea indica um filme pra um amigo, voc\u00ea est\u00e1 "vendendo"?', 4),
  ('Preciso pensar', 'Claro! Pensar \u00e9 importante. O que exatamente precisa ser pensado? Posso ajudar a esclarecer agora para voc\u00ea tomar a melhor decis\u00e3o.', 5);

-- Icebreakers
insert into icebreakers (text, order_idx) values
  ('Eu acabei de descobrir uma coisa que me ajudou a mudar minha situa\u00e7\u00e3o financeira. Topa conhecer?', 1),
  ('Lembrei de voc\u00ea agora. Voc\u00ea est\u00e1 buscando renda extra ou est\u00e1 satisfeito com a atual?', 2),
  ('Oi! Posso compartilhar uma ideia de neg\u00f3cio com voc\u00ea em 15 minutos?', 3),
  ('Voc\u00ea j\u00e1 pensou em ter uma renda extra sem largar seu trabalho?', 4),
  ('Estou em um projeto muito bom e voc\u00ea me veio em mente. Posso te mostrar?', 5),
  ('Ei, que bom falar com voc\u00ea! Tenho algo que pode interessar. Tem 20 minutos?', 6),
  ('Precisava da sua opini\u00e3o sobre algo. Posso te mostrar?', 7),
  ('Vi que voc\u00ea sempre foi empreendedor. Posso te apresentar uma oportunidade?', 8);

-- Closing Laws (3 Leis do Fechamento)
insert into closing_laws (name, description, icon, example, order_idx) values
  ('Lei da Pergunta', 'Quem pergunta, conduz. Termine sempre com uma pergunta que leve ao SIM.', 'quiz',
   'Voc\u00ea prefere come\u00e7ar com o kit A ou com o kit B?', 1),
  ('Lei da Perspectiva', 'Ajude a pessoa a enxergar o resultado futuro. Fa\u00e7a o sonho virar imagem.', 'visibility',
   'Imagine sua vida daqui 12 meses com essa renda extra pagando as contas.', 2),
  ('Lei da Urg\u00eancia', 'Mostre o custo de n\u00e3o decidir agora. Tempo \u00e9 a commodity mais cara.', 'timer',
   'A promo\u00e7\u00e3o termina sexta-feira. Vamos garantir seu lugar hoje?', 3);

-- Closing Scripts (templates de fechamento)
insert into closing_scripts (name, template, order_idx) values
  ('Direto',
   'Voc\u00ea gostou do que viu? Ent\u00e3o vamos dar o primeiro passo agora. Me envia sua melhor foto pra gente criar seu cadastro.',
   1),
  ('Consultivo',
   'Com base no que voc\u00ea me contou, vejo que [dor identificada]. Nosso plano [beneficio] resolve exatamente isso. Voc\u00ea prefere come\u00e7ar com o kit b\u00e1sico ou com o kit premium?',
   2);

-- Audios
insert into audios (id, title, duration_seconds, order_idx) values
  ('a1', 'Boas-vindas \u00e0 LiderTraining', 420, 1),
  ('a2', 'Fundamentos do Marketing de Rede', 780, 2),
  ('a3', 'Mindset de Consultor Elite', 540, 3),
  ('a4', 'Lista de Contatos: Como Montar', 360, 4),
  ('a5', 'Convite Poderoso em 30 segundos', 480, 5),
  ('a6', 'Apresenta\u00e7\u00e3o Efetiva', 900, 6),
  ('a7', 'Fechamento sem Press\u00e3o', 600, 7),
  ('a8', 'Lideran\u00e7a e Duplica\u00e7\u00e3o', 720, 8);

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
  ('Apresente sua hist\u00f3ria', 3),
  ('Mostre a oportunidade', 4),
  ('Apresente o plano de compensa\u00e7\u00e3o', 5),
  ('Antecipe objeções', 6),
  ('Fa\u00e7a o fechamento', 7),
  ('Marque o acompanhamento', 8);

-- FIR Steps (8 etapas de First Introduction Reality)
insert into fir_steps (id, title, reward_xp, order_idx) values
  (1, 'Leia o Manual do Consultor', 50, 1),
  (2, 'Assista ao v\u00eddeo de boas-vindas', 50, 2),
  (3, 'Monte sua lista inicial (50 nomes)', 100, 3),
  (4, 'Fa\u00e7a seu primeiro pedido pessoal', 150, 4),
  (5, 'Agende sua primeira apresenta\u00e7\u00e3o', 100, 5),
  (6, 'Convide 3 pessoas', 150, 6),
  (7, 'Participe de uma reuni\u00e3o online', 50, 7),
  (8, 'Complete a avalia\u00e7\u00e3o de scout', 100, 8);

-- Presentation Formats (4 formas de apresentar)
insert into presentation_formats (format, order_idx) values
  ('Presencial \u2014 1 a 1', 1),
  ('Online \u2014 v\u00eddeo chamada', 2),
  ('V\u00eddeo gravado', 3),
  ('Evento em grupo', 4);

-- Missions seed (4 exemplos iniciais)
insert into missions (id, name, description, type, target, reward_xp, duration_seconds, requirements) values
  ('m1', 'Sprint de Convites', 'Fa\u00e7a 5 convites em 6 horas', 'flash', 5, 100, 21600,
   '{"event":"add_lead"}'::jsonb),
  ('m2', 'Construtor de Rede', 'Adicione 10 contatos na semana', 'weekly', 10, 200, null,
   '{"event":"add_lead"}'::jsonb),
  ('m3', 'Streak de Fogo', 'Mantenha 15 dias de streak', 'achievement', 15, 500, null,
   '{"event":"streak"}'::jsonb),
  ('m4', 'Fechador Elite', 'Feche 3 vendas este m\u00eas', 'achievement', 3, 300, null,
   '{"event":"close_lead"}'::jsonb);
