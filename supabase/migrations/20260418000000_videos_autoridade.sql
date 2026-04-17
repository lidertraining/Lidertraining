-- ============================================================
-- LiderTraining — Biblioteca de Vídeos de Autoridade
-- ============================================================
-- IMPORTANTE: sistema NÃO hospeda vídeos. Apenas guarda links
-- públicos (YouTube, Instagram, TikTok) pra compartilhamento.
-- ============================================================

drop table if exists envios_video cascade;
drop table if exists videos_autoridade cascade;
drop table if exists contextos_video cascade;
drop table if exists autoridades cascade;

-- ------------------------------------------------------------
-- AUTORIDADES
-- ------------------------------------------------------------
create table autoridades (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique not null,
  especialidade text,
  canal_youtube text,
  instagram text,
  foto_url text,
  ativo boolean not null default true,
  ordem smallint not null default 0,
  created_at timestamptz not null default now()
);

create index autoridades_ativo_idx on autoridades(ativo, ordem);

-- ------------------------------------------------------------
-- CONTEXTOS (onde o vídeo pode ser usado)
-- ------------------------------------------------------------
create table contextos_video (
  id text primary key,
  nome text not null,
  descricao text,
  estagio text not null check (estagio in ('convite','follow_up','objecao','boas_vindas','onboarding','mentalidade','producao')),
  ordem smallint not null default 0
);

-- ------------------------------------------------------------
-- VIDEOS
-- ------------------------------------------------------------
create table videos_autoridade (
  id uuid primary key default gen_random_uuid(),
  autoridade_id uuid not null references autoridades(id) on delete cascade,
  plataforma text not null check (plataforma in ('youtube','instagram','tiktok','outros')),
  url_original text not null,
  url_externa text,
  titulo text not null,
  descricao_curta text,
  duracao_segundos int,
  thumbnail_url text,
  contextos text[] not null default array[]::text[],
  intensidade smallint not null default 3 check (intensidade between 1 and 5),
  mensagens_templates jsonb not null default '[]'::jsonb,
  tags text[] not null default array[]::text[],
  status text not null default 'rascunho' check (status in ('rascunho','publicado','arquivado')),
  link_funcionando boolean not null default true,
  verificado_em timestamptz,
  criado_por uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index videos_status_idx on videos_autoridade(status, link_funcionando);
create index videos_autoridade_idx on videos_autoridade(autoridade_id);
create index videos_contextos_idx on videos_autoridade using gin(contextos);

create trigger videos_autoridade_updated_at before update on videos_autoridade
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- ENVIOS (analytics)
-- ------------------------------------------------------------
create table envios_video (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references videos_autoridade(id) on delete cascade,
  consultor_id uuid not null references profiles(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  contexto text,
  mensagem_usada text,
  enviado_em timestamptz not null default now()
);

create index envios_consultor_idx on envios_video(consultor_id);
create index envios_video_idx on envios_video(video_id);
create index envios_lead_idx on envios_video(lead_id);

-- ------------------------------------------------------------
-- VIEW com stats
-- ------------------------------------------------------------
create or replace view videos_com_stats as
  select
    v.*,
    a.nome as autoridade_nome,
    a.foto_url as autoridade_foto,
    coalesce((select count(*) from envios_video where video_id = v.id), 0) as total_envios,
    coalesce((select count(distinct consultor_id) from envios_video where video_id = v.id), 0) as consultores_unicos
  from videos_autoridade v
  join autoridades a on a.id = v.autoridade_id;

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------
alter table autoridades enable row level security;
create policy autoridades_read on autoridades for select to authenticated using (ativo = true);
create policy autoridades_admin on autoridades for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

alter table contextos_video enable row level security;
create policy contextos_read on contextos_video for select to authenticated using (true);
create policy contextos_admin on contextos_video for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

alter table videos_autoridade enable row level security;
create policy videos_read on videos_autoridade for select to authenticated
  using (status = 'publicado' and link_funcionando = true);
create policy videos_admin on videos_autoridade for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

alter table envios_video enable row level security;
create policy envios_owner on envios_video for all
  using (consultor_id = auth.uid()) with check (consultor_id = auth.uid());
create policy envios_admin_read on envios_video for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ------------------------------------------------------------
-- SEED — Autoridades iniciais
-- ------------------------------------------------------------
insert into autoridades (nome, slug, especialidade, canal_youtube, ordem) values
  ('Flávio Augusto', 'flavio-augusto', 'Empreendedorismo · Geração de Valor', '@FlavioAugustoGeracaodeValor', 1),
  ('Caio Carneiro', 'caio-carneiro', 'Vendas · Alta Performance', '@caiocarneirooficial', 2),
  ('Geronimo Theml', 'geronimo-theml', 'Produtividade · Prioridade', '@geronimotheml', 3),
  ('Thiago Nigro', 'thiago-nigro', 'Finanças · Investimentos', '@oprimorico', 4),
  ('Joel Jota', 'joel-jota', 'Disciplina · Alta Performance', '@joeljota', 5);

-- ------------------------------------------------------------
-- SEED — Contextos
-- ------------------------------------------------------------
insert into contextos_video (id, nome, descricao, estagio, ordem) values
  ('convite_curiosidade', 'Convite · Curiosidade', 'Gerar interesse antes do 1x1', 'convite', 1),
  ('convite_pos_marcado', 'Convite · Pós-agendamento', 'Aquecer após marcar apresentação', 'convite', 2),
  ('follow_up_transformacao', 'Follow-up · Transformação', 'História de mudança de vida', 'follow_up', 3),
  ('follow_up_nutrir', 'Follow-up · Nutrir', 'Alimentar lead indeciso', 'follow_up', 4),
  ('objecao_tempo', 'Objeção · Tempo', '"Não tenho tempo"', 'objecao', 5),
  ('objecao_dinheiro', 'Objeção · Dinheiro', '"Está caro / não posso investir"', 'objecao', 6),
  ('objecao_pensar', 'Objeção · Pensar', '"Vou pensar / me decido depois"', 'objecao', 7),
  ('objecao_familia', 'Objeção · Família', '"Cônjuge/família não apoia"', 'objecao', 8),
  ('objecao_vendas', 'Objeção · Vendas', '"Não sou vendedor"', 'objecao', 9),
  ('objecao_medo', 'Objeção · Medo', 'Medo de começar / falhar', 'objecao', 10),
  ('boas_vindas_cliente', 'Boas-vindas · Cliente', 'Recém-fechou venda', 'boas_vindas', 11),
  ('onboarding_consultor', 'Onboarding · Consultor', 'Novo consultor do time', 'onboarding', 12),
  ('mentalidade_geral', 'Mentalidade', 'Motivacional amplo', 'mentalidade', 13),
  ('producao_disciplina', 'Produção · Disciplina', 'Produtividade / foco', 'producao', 14),
  ('producao_metas', 'Produção · Metas', 'Bater metas / performance', 'producao', 15);
