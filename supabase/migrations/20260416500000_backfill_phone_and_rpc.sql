-- ============================================================
-- LiderTraining — Garante coluna phone + RPC 3 params
-- ============================================================
-- Esta migração é idempotente: pode ser rodada várias vezes
-- sem causar problemas. Garante que:
--   1. Coluna profiles.phone existe
--   2. RPC signup_with_invite aceita p_phone
--   3. RPC get_team_learning retorna phone
-- ============================================================

alter table profiles
  add column if not exists phone text;

-- Permite o próprio usuário atualizar o telefone
revoke update on profiles from authenticated;
grant update (name, avatar_url, comm_goal, onboarded, fir_step, fir_completed, streak_freeze_active, phone, streak, freezes) on profiles to authenticated;

-- ------------------------------------------------------------
-- signup_with_invite(p_code, p_name, p_phone)
-- ------------------------------------------------------------
create or replace function signup_with_invite(p_code text, p_name text, p_phone text default null)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite invite_codes;
  v_profile profiles;
  v_phone_digits text;
begin
  v_phone_digits := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  if length(v_phone_digits) = 0 then
    v_phone_digits := null;
  end if;

  select * into v_invite from invite_codes where code = p_code for update;
  if v_invite is null then
    raise exception 'invalid code';
  end if;
  if v_invite.expires_at is not null and v_invite.expires_at < now() then
    raise exception 'expired code';
  end if;
  if v_invite.uses >= v_invite.max_uses then
    raise exception 'code exhausted';
  end if;

  insert into profiles(id, upline_id, name, phone)
  values (auth.uid(), v_invite.owner_id, p_name, v_phone_digits)
  returning * into v_profile;

  insert into invite_codes (code, owner_id, max_uses, uses, expires_at)
  values (v_profile.personal_code, v_profile.id, 999999, 0, null)
  on conflict (code) do nothing;

  update invite_codes set uses = uses + 1 where code = p_code;
  update profiles set team_count = team_count + 1 where id = v_invite.owner_id;

  insert into notifications(user_id, type, message, icon)
  values (v_invite.owner_id, 'team', p_name || ' entrou na sua equipe!', 'group_add');

  return v_profile;
end;
$$;

grant execute on function signup_with_invite(text, text, text) to authenticated;

-- ------------------------------------------------------------
-- get_team_learning com phone
-- ------------------------------------------------------------
create or replace function get_team_learning(p_depth int default 6)
returns table (
  id uuid,
  upline_id uuid,
  name text,
  phone text,
  level user_level,
  depth int,
  journey_step smallint,
  fir_step smallint,
  fir_completed boolean,
  streak int,
  weekly_xp int,
  xp int,
  last_active date,
  audios_done int,
  audios_total int,
  notes_written int,
  leads_count int,
  days_since_active int
)
language sql
stable
security definer
set search_path = public
as $$
  with recursive tree as (
    select p.*, 1 as d
    from profiles p
    where p.upline_id = auth.uid()
    union all
    select p.*, t.d + 1
    from profiles p
    join tree t on p.upline_id = t.id
    where t.d < p_depth
  ),
  audio_counts as (
    select user_id, count(*) as done
    from audio_progress
    where completed = true
    group by user_id
  ),
  audio_total as (
    select count(*) as total from audios
  ),
  notes_counts as (
    select user_id, count(*) as written
    from step_notes
    where length(trim(content)) > 0
    group by user_id
  ),
  lead_counts as (
    select user_id, count(*) as total
    from leads
    group by user_id
  )
  select
    t.id,
    t.upline_id,
    t.name,
    t.phone,
    t.level,
    t.d as depth,
    t.journey_step,
    t.fir_step,
    t.fir_completed,
    t.streak,
    t.weekly_xp,
    t.xp,
    t.last_active,
    coalesce(ac.done, 0)::int as audios_done,
    (select total from audio_total)::int as audios_total,
    coalesce(nc.written, 0)::int as notes_written,
    coalesce(lc.total, 0)::int as leads_count,
    case
      when t.last_active is null then 999
      else (current_date - t.last_active)::int
    end as days_since_active
  from tree t
  left join audio_counts ac on ac.user_id = t.id
  left join notes_counts nc on nc.user_id = t.id
  left join lead_counts lc on lc.user_id = t.id
  order by t.d, t.name;
$$;

grant execute on function get_team_learning(int) to authenticated;
