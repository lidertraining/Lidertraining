-- ============================================================
-- LiderTraining — Corrige escapes \uXXXX literais no conteúdo
-- ============================================================
-- O seed original (20260415000300) continha literais como
-- 'Sua Hist\u00f3ria'. Postgres não decodifica \u em strings
-- normais, então o texto foi gravado literal no banco.
-- Este script reescreve o conteúdo com UTF-8 correto.
-- ============================================================

-- Journey Steps
update journey_steps set name = 'Defina seu Sonho',  description = 'Por que você está aqui?'      where id = 0;
update journey_steps set name = 'Monte sua Lista',   description = 'Pessoas que você conhece'     where id = 1;
update journey_steps set name = 'Sua História',      description = 'Conecte com emoção'           where id = 2;
update journey_steps set name = 'Vire Produto',      description = 'Use o que vende'              where id = 3;
update journey_steps set name = 'Aprenda a Contar',  description = 'Storytelling de impacto'      where id = 4;
update journey_steps set name = 'Prospecção',        description = 'Como abordar'                 where id = 5;
update journey_steps set name = 'Convite',           description = 'Chame para conhecer'          where id = 6;
update journey_steps set name = 'Apresentação',      description = '4 formas de mostrar'          where id = 7;
update journey_steps set name = 'Fechamento',        description = 'As 3 Leis'                    where id = 8;
update journey_steps set name = 'Acompanhamento',    description = 'Follow-up eficiente'          where id = 9;
update journey_steps set name = 'Duplicação',        description = 'Ensine quem entrou'           where id = 10;

-- Objections (por order_idx)
update objections set
  objection = 'Não tenho dinheiro',
  response  = 'Por isso mesmo! Quando começamos, eu também não tinha. Justamente essa falta foi o que me fez entrar. Qual seria um valor que você considera investir no seu futuro?'
where order_idx = 1;

update objections set
  objection = 'Isso é pirâmide?',
  response  = 'Entendo a preocupação. Pirâmides são ilegais justamente porque não há produto real. A [empresa] tem [X anos], vende produtos consumidos por milhões. Você ganha comercializando, não indicando pessoas.'
where order_idx = 2;

update objections set
  objection = 'Não tenho tempo',
  response  = 'Entendo perfeitamente. Por isso eu comecei no meu tempo vago. 1 ou 2 horas por dia já me trouxeram resultados. Quanto tempo você consegue hoje?'
where order_idx = 3;

update objections set
  objection = 'Não gosto de vender',
  response  = 'Nós não vendemos: nós indicamos o que já usamos e gostamos. Quando você indica um filme pra um amigo, você está "vendendo"?'
where order_idx = 4;

update objections set
  objection = 'Preciso pensar',
  response  = 'Claro! Pensar é importante. O que exatamente precisa ser pensado? Posso ajudar a esclarecer agora para você tomar a melhor decisão.'
where order_idx = 5;

-- Icebreakers
update icebreakers set text = 'Eu acabei de descobrir uma coisa que me ajudou a mudar minha situação financeira. Topa conhecer?' where order_idx = 1;
update icebreakers set text = 'Lembrei de você agora. Você está buscando renda extra ou está satisfeito com a atual?'             where order_idx = 2;
update icebreakers set text = 'Oi! Posso compartilhar uma ideia de negócio com você em 15 minutos?'                               where order_idx = 3;
update icebreakers set text = 'Você já pensou em ter uma renda extra sem largar seu trabalho?'                                    where order_idx = 4;
update icebreakers set text = 'Estou em um projeto muito bom e você me veio em mente. Posso te mostrar?'                          where order_idx = 5;
update icebreakers set text = 'Ei, que bom falar com você! Tenho algo que pode interessar. Tem 20 minutos?'                       where order_idx = 6;
update icebreakers set text = 'Precisava da sua opinião sobre algo. Posso te mostrar?'                                            where order_idx = 7;
update icebreakers set text = 'Vi que você sempre foi empreendedor. Posso te apresentar uma oportunidade?'                        where order_idx = 8;

-- Closing Laws
update closing_laws set
  name = 'Lei da Pergunta',
  description = 'Quem pergunta, conduz. Termine sempre com uma pergunta que leve ao SIM.',
  example = 'Você prefere começar com o kit A ou com o kit B?'
where order_idx = 1;

update closing_laws set
  name = 'Lei da Perspectiva',
  description = 'Ajude a pessoa a enxergar o resultado futuro. Faça o sonho virar imagem.',
  example = 'Imagine sua vida daqui 12 meses com essa renda extra pagando as contas.'
where order_idx = 2;

update closing_laws set
  name = 'Lei da Urgência',
  description = 'Mostre o custo de não decidir agora. Tempo é a commodity mais cara.',
  example = 'A promoção termina sexta-feira. Vamos garantir seu lugar hoje?'
where order_idx = 3;

-- Closing Scripts
update closing_scripts set
  name = 'Direto',
  template = 'Você gostou do que viu? Então vamos dar o primeiro passo agora. Me envia sua melhor foto pra gente criar seu cadastro.'
where order_idx = 1;

update closing_scripts set
  name = 'Consultivo',
  template = 'Com base no que você me contou, vejo que [dor identificada]. Nosso plano [benefício] resolve exatamente isso. Você prefere começar com o kit básico ou com o kit premium?'
where order_idx = 2;

-- Audios
update audios set title = 'Boas-vindas à LiderTraining'        where id = 'a1';
update audios set title = 'Fundamentos do Marketing de Rede'   where id = 'a2';
update audios set title = 'Mindset de Consultor Elite'         where id = 'a3';
update audios set title = 'Lista de Contatos: Como Montar'     where id = 'a4';
update audios set title = 'Convite Poderoso em 30 segundos'    where id = 'a5';
update audios set title = 'Apresentação Efetiva'               where id = 'a6';
update audios set title = 'Fechamento sem Pressão'             where id = 'a7';
update audios set title = 'Liderança e Duplicação'             where id = 'a8';

-- Plano 1x1
update one_on_one_plan set step = 'Quebra-gelo e rapport'              where order_idx = 1;
update one_on_one_plan set step = 'Entenda o sonho da pessoa'          where order_idx = 2;
update one_on_one_plan set step = 'Apresente sua história'             where order_idx = 3;
update one_on_one_plan set step = 'Mostre a oportunidade'              where order_idx = 4;
update one_on_one_plan set step = 'Apresente o plano de compensação'   where order_idx = 5;
update one_on_one_plan set step = 'Antecipe objeções'                  where order_idx = 6;
update one_on_one_plan set step = 'Faça o fechamento'                  where order_idx = 7;
update one_on_one_plan set step = 'Marque o acompanhamento'            where order_idx = 8;

-- FIR Steps
update fir_steps set title = 'Leia o Manual do Consultor'         where id = 1;
update fir_steps set title = 'Assista ao vídeo de boas-vindas'    where id = 2;
update fir_steps set title = 'Monte sua lista inicial (50 nomes)' where id = 3;
update fir_steps set title = 'Faça seu primeiro pedido pessoal'   where id = 4;
update fir_steps set title = 'Agende sua primeira apresentação'   where id = 5;
update fir_steps set title = 'Convide 3 pessoas'                  where id = 6;
update fir_steps set title = 'Participe de uma reunião online'    where id = 7;
update fir_steps set title = 'Complete a avaliação de scout'      where id = 8;

-- Presentation Formats
update presentation_formats set format = 'Presencial — 1 a 1'      where order_idx = 1;
update presentation_formats set format = 'Online — vídeo chamada'  where order_idx = 2;
update presentation_formats set format = 'Vídeo gravado'           where order_idx = 3;
update presentation_formats set format = 'Evento em grupo'         where order_idx = 4;

-- Missions
update missions set description = 'Faça 5 convites em 6 horas'     where id = 'm1';
update missions set description = 'Adicione 10 contatos na semana' where id = 'm2';
update missions set description = 'Mantenha 15 dias de streak'     where id = 'm3';
update missions set description = 'Feche 3 vendas este mês'        where id = 'm4';
