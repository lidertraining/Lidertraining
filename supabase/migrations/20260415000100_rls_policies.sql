-- ============================================================
-- LiderTraining \u2014 RLS Policies
-- ============================================================

-- ------------------------------------------------------------
-- Helper: is_ancestor_of(ancestor, descendant)
-- Usa CTE recursiva sobre profiles.upline_id
-- ------------------------------------------------------------
create or replace function is_ancestor_of(ancestor uuid, descendant uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with recursive chain as (
    select id, upline_id from profiles where id = descendant
    union all
    select p.id, p.upline_id from profiles p join chain c on p.id = c.upline_id
  )
  select exists(select 1 from chain where upline_id = ancestor);
$$;

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------
alter table profiles enable row level security;

create policy profiles_read_self on profiles for select
  using (auth.uid() = id);

create policy profiles_read_downline on profiles for select
  using (is_ancestor_of(auth.uid(), id));

-- Writes de usu\u00e1rio: apenas colunas "seguras". XP/level/streak \u00e9 via RPC.
create policy profiles_update_self on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Revogar acesso global a UPDATE, conceder apenas colunas permitidas
revoke update on profiles from authenticated;
grant update (name, avatar_url, comm_goal, onboarded) on profiles to authenticated;

-- ------------------------------------------------------------
-- INVITE CODES
-- ------------------------------------------------------------
alter table invite_codes enable row level security;

create policy invite_owner_full on invite_codes for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- ------------------------------------------------------------
-- LEADS
-- ------------------------------------------------------------
alter table leads enable row level security;

create policy leads_owner_full on leads for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ------------------------------------------------------------
-- MISSIONS (templates \u2014 p\u00fablicos p/ autenticados)
-- ------------------------------------------------------------
alter table missions enable row level security;

create policy missions_read_all on missions for select to authenticated
  using (true);

-- USER_MISSIONS
alter table user_missions enable row level security;

create policy user_missions_read_self on user_missions for select
  using (user_id = auth.uid());

-- writes via RPC \u2014 sem policy para INSERT/UPDATE direto

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------------------
alter table notifications enable row level security;

create policy notifications_read_self on notifications for select
  using (user_id = auth.uid());

create policy notifications_update_self on notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ------------------------------------------------------------
-- FEED EVENTS
-- ------------------------------------------------------------
alter table feed_events enable row level security;

create policy feed_read_self on feed_events for select
  using (user_id = auth.uid());

create policy feed_read_downline on feed_events for select
  using (
    visibility in ('self_and_downline', 'team', 'public')
    and is_ancestor_of(auth.uid(), user_id)
  );

-- ------------------------------------------------------------
-- AUDIO PROGRESS / STEP NOTES \u2014 dono
-- ------------------------------------------------------------
alter table audio_progress enable row level security;
create policy audio_owner_full on audio_progress for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table step_notes enable row level security;
create policy notes_owner_full on step_notes for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ------------------------------------------------------------
-- CONTE\u00daDO EST\u00c1TICO \u2014 leitura p\u00fablica para autenticados
-- ------------------------------------------------------------
alter table journey_steps enable row level security;
create policy jstep_read on journey_steps for select to authenticated using (true);

alter table objections enable row level security;
create policy obj_read on objections for select to authenticated using (true);

alter table icebreakers enable row level security;
create policy ice_read on icebreakers for select to authenticated using (true);

alter table closing_laws enable row level security;
create policy laws_read on closing_laws for select to authenticated using (true);

alter table closing_scripts enable row level security;
create policy scripts_read on closing_scripts for select to authenticated using (true);

alter table audios enable row level security;
create policy audios_read on audios for select to authenticated using (true);

alter table golden_rules enable row level security;
create policy rules_read on golden_rules for select to authenticated using (true);

alter table one_on_one_plan enable row level security;
create policy plan_read on one_on_one_plan for select to authenticated using (true);

alter table fir_steps enable row level security;
create policy fir_read on fir_steps for select to authenticated using (true);

alter table presentation_formats enable row level security;
create policy pres_read on presentation_formats for select to authenticated using (true);
