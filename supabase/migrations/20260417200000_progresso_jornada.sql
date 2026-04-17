-- ============================================================
-- LiderTraining — Jornada V2: progresso por passo
-- ============================================================

drop table if exists progresso_jornada cascade;

create table progresso_jornada (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references profiles(id) on delete cascade,
  passo_num int not null check (passo_num >= 0 and passo_num <= 10),
  status text not null default 'disponivel' check (status in ('bloqueado','disponivel','em_andamento','concluido')),
  dados jsonb not null default '{}'::jsonb,
  iniciado_em timestamptz,
  concluido_em timestamptz,
  xp_ganho int not null default 0,
  atualizado_em timestamptz not null default now(),
  unique(usuario_id, passo_num)
);

create index progresso_jornada_user_idx on progresso_jornada(usuario_id);

alter table progresso_jornada enable row level security;

create policy progresso_owner on progresso_jornada for all
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

create policy progresso_admin_read on progresso_jornada for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy progresso_leader_read on progresso_jornada for select
  using (is_ancestor_of(auth.uid(), usuario_id));
