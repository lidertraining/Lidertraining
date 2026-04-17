-- ============================================================
-- LiderTraining — Sistema de Conhecimento (NotebookLM)
-- ============================================================

-- Limpa qualquer resquício de execução parcial anterior
drop table if exists quiz_respostas cascade;
drop table if exists quiz_perguntas cascade;
drop table if exists flashcard_revisoes cascade;
drop table if exists flashcards cascade;
drop table if exists conhecimento_consumo cascade;
drop table if exists conhecimentos cascade;

-- ------------------------------------------------------------
-- CONHECIMENTOS (tabela principal)
-- ------------------------------------------------------------
create table conhecimentos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('audio','video','report','mapa_mental','flashcards','quiz')),
  titulo text not null,
  descricao text,
  categoria text not null default 'geral',
  passo_jornada smallint check (passo_jornada is null or passo_jornada between 0 and 11),
  obrigatorio boolean not null default false,
  xp_reward int not null default 20,
  duracao_segundos int,
  conteudo_texto text,
  arquivo_path text,
  thumbnail_url text,
  ordem smallint not null default 0,
  ativo boolean not null default true,
  criado_por uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index conhecimentos_tipo_idx on conhecimentos(tipo, ativo);
create index conhecimentos_passo_idx on conhecimentos(passo_jornada) where passo_jornada is not null;
create index conhecimentos_categoria_idx on conhecimentos(categoria, ativo);

-- Trigger updated_at
create trigger conhecimentos_updated_at before update on conhecimentos
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- CONSUMO (tracking de progresso por usuário)
-- ------------------------------------------------------------
create table conhecimento_consumo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  conhecimento_id uuid not null references conhecimentos(id) on delete cascade,
  progresso_pct smallint not null default 0 check (progresso_pct between 0 and 100),
  posicao_segundos int not null default 0,
  concluido boolean not null default false,
  concluido_at timestamptz,
  tentativas int not null default 0,
  ultima_nota smallint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, conhecimento_id)
);

create index consumo_user_idx on conhecimento_consumo(user_id, concluido);

create trigger consumo_updated_at before update on conhecimento_consumo
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- FLASHCARDS (cards individuais de um conhecimento tipo flashcards)
-- ------------------------------------------------------------
create table flashcards (
  id uuid primary key default gen_random_uuid(),
  conhecimento_id uuid not null references conhecimentos(id) on delete cascade,
  frente text not null,
  verso text not null,
  ordem smallint not null default 0
);

create index flashcards_conhecimento_idx on flashcards(conhecimento_id, ordem);

-- Revisão espaçada por card por user
create table flashcard_revisoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  flashcard_id uuid not null references flashcards(id) on delete cascade,
  qualidade smallint not null check (qualidade between 0 and 5),
  intervalo_dias int not null default 1,
  fator real not null default 2.5,
  proxima_revisao date not null default current_date,
  revisoes int not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, flashcard_id)
);

-- ------------------------------------------------------------
-- QUIZ (perguntas de um conhecimento tipo quiz)
-- ------------------------------------------------------------
create table quiz_perguntas (
  id uuid primary key default gen_random_uuid(),
  conhecimento_id uuid not null references conhecimentos(id) on delete cascade,
  pergunta text not null,
  alternativas jsonb not null default '[]'::jsonb,
  resposta_correta smallint not null,
  explicacao text,
  ordem smallint not null default 0
);

create index quiz_conhecimento_idx on quiz_perguntas(conhecimento_id, ordem);

-- Respostas do usuário
create table quiz_respostas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  pergunta_id uuid not null references quiz_perguntas(id) on delete cascade,
  resposta_escolhida smallint not null,
  correta boolean not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table conhecimentos enable row level security;
create policy conhecimentos_read on conhecimentos for select to authenticated
  using (ativo = true);
create policy conhecimentos_admin_all on conhecimentos for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

alter table conhecimento_consumo enable row level security;
create policy consumo_owner on conhecimento_consumo for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
-- Líderes podem ler consumo da downline
create policy consumo_downline_read on conhecimento_consumo for select
  using (is_ancestor_of(auth.uid(), user_id));

alter table flashcards enable row level security;
create policy flashcards_read on flashcards for select to authenticated using (true);
create policy flashcards_admin on flashcards for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

alter table flashcard_revisoes enable row level security;
create policy revisoes_owner on flashcard_revisoes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table quiz_perguntas enable row level security;
create policy quiz_read on quiz_perguntas for select to authenticated using (true);
create policy quiz_admin on quiz_perguntas for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

alter table quiz_respostas enable row level security;
create policy respostas_owner on quiz_respostas for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Grant para Storage (bucket 'conhecimentos')
-- Nota: criar o bucket no Dashboard > Storage > New Bucket > Nome: conhecimentos > Private
