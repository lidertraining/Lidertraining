-- ============================================================
-- LiderTraining — FIR Digital Elite: tabela de respostas
-- ============================================================

drop table if exists fir_respostas cascade;

create table fir_respostas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references profiles(id) on delete cascade,
  dados jsonb not null,
  xp_ganho int not null default 1300,
  concluido_em timestamptz not null default now(),
  unique(usuario_id)
);

alter table fir_respostas enable row level security;

create policy fir_resp_owner on fir_respostas for all
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

create policy fir_resp_admin_read on fir_respostas for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy fir_resp_leader_read on fir_respostas for select
  using (is_ancestor_of(auth.uid(), usuario_id));
