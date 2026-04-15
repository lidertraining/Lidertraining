-- ============================================================
-- LiderTraining \u2014 Functions & Triggers
-- ============================================================
-- Todas as muta\u00e7\u00f5es de gamifica\u00e7\u00e3o passam por fun\u00e7\u00f5es security definer
-- para impedir manipula\u00e7\u00e3o direta via client (RLS + grant de colunas).
-- ============================================================

-- ------------------------------------------------------------
-- add_xp(amount, reason) \u2014 \u00fanico canal de muta\u00e7\u00e3o de XP
-- ------------------------------------------------------------
create or replace function add_xp(p_amount int, p_reason text default null)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile profiles;
  v_new_level user_level;
begin
  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  -- Rate-limit b\u00e1sico
  if (
    select coalesce(sum(reward_xp), 0)
    from user_missions um
    join missions m on m.id = um.mission_id
    where um.user_id = auth.uid()
      and um.completed_at > now() - interval '1 minute'
  ) > 2000 then
    raise exception 'xp rate limit';
  end if;

  update profiles set
    xp = xp + p_amount,
    weekly_xp = weekly_xp + p_amount
  where id = auth.uid()
  returning * into v_profile;

  -- Recalcular level
  v_new_level := case
    when v_profile.xp >= 20000 then 'Elite'::user_level
    when v_profile.xp >= 10000 then 'Diamante'::user_level
    when v_profile.xp >= 5000 then 'Ouro'::user_level
    when v_profile.xp >= 2000 then 'Prata'::user_level
    else 'Master'::user_level
  end;

  if v_new_level <> v_profile.level then
    update profiles set level = v_new_level where id = v_profile.id
    returning * into v_profile;

    insert into notifications(user_id, type, message, icon)
    values(v_profile.id, 'xp', 'Voc\u00ea alcan\u00e7ou ' || v_new_level || '!', 'military_tech');
  end if;

  insert into feed_events(user_id, actor_name, action, icon)
  values (
    v_profile.id,
    v_profile.name,
    'ganhou ' || p_amount || ' XP' || coalesce(' (' || p_reason || ')', ''),
    'star'
  );

  return v_profile;
end;
$$;

grant execute on function add_xp(int, text) to authenticated;

-- ------------------------------------------------------------
-- complete_journey_step(step)
-- ------------------------------------------------------------
create or replace function complete_journey_step(p_step smallint)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile profiles;
begin
  select * into v_profile from profiles where id = auth.uid();
  if v_profile.journey_step <> p_step then
    raise exception 'not current step';
  end if;

  update profiles set journey_step = p_step + 1 where id = auth.uid();
  perform add_xp(100, 'Passo ' || p_step);
  select * into v_profile from profiles where id = auth.uid();
  return v_profile;
end;
$$;

grant execute on function complete_journey_step(smallint) to authenticated;

-- ------------------------------------------------------------
-- signup_with_invite(code, name) \u2014 chamado p\u00f3s auth.signUp
-- ------------------------------------------------------------
create or replace function signup_with_invite(p_code text, p_name text)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite invite_codes;
  v_profile profiles;
begin
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

  insert into profiles(id, upline_id, name)
  values (auth.uid(), v_invite.owner_id, p_name)
  returning * into v_profile;

  update invite_codes set uses = uses + 1 where code = p_code;

  -- incrementar team_count do upline
  update profiles set team_count = team_count + 1 where id = v_invite.owner_id;

  insert into notifications(user_id, type, message, icon)
  values (v_invite.owner_id, 'team', p_name || ' entrou na sua equipe!', 'group_add');

  return v_profile;
end;
$$;

grant execute on function signup_with_invite(text, text) to authenticated;

-- ------------------------------------------------------------
-- tick_streak()
-- Chamado no boot do app.
-- ------------------------------------------------------------
create or replace function tick_streak()
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v profiles;
begin
  select * into v from profiles where id = auth.uid();
  if v.last_active = current_date then
    return v;
  end if;

  if v.last_active = current_date - 1 then
    update profiles set streak = streak + 1, last_active = current_date where id = v.id;
  elsif v.last_active is not null then
    if v.streak_freeze_active and v.freezes > 0 then
      update profiles set
        streak_freeze_active = false,
        freezes = freezes - 1,
        last_active = current_date
      where id = v.id;
    else
      update profiles set streak = 1, last_active = current_date where id = v.id;
    end if;
  else
    update profiles set streak = 1, last_active = current_date where id = v.id;
  end if;

  select * into v from profiles where id = v.id;
  return v;
end;
$$;

grant execute on function tick_streak() to authenticated;

-- ------------------------------------------------------------
-- refill_energy() \u2014 recarrega 1 por hora
-- ------------------------------------------------------------
create or replace function refill_energy()
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v profiles;
  v_hours int;
begin
  select * into v from profiles where id = auth.uid();
  v_hours := floor(extract(epoch from (now() - v.energy_last_refill)) / 3600);
  if v_hours > 0 and v.energy < v.max_energy then
    update profiles set
      energy = least(v.max_energy, v.energy + v_hours),
      energy_last_refill = v.energy_last_refill + (v_hours || ' hours')::interval
    where id = v.id;
  end if;
  select * into v from profiles where id = v.id;
  return v;
end;
$$;

grant execute on function refill_energy() to authenticated;

-- ------------------------------------------------------------
-- get_downline(depth) \u2014 retorna rede para \u00e1rvore e painel de l\u00edder
-- ------------------------------------------------------------
create or replace function get_downline(p_depth int default 6)
returns table (
  id uuid,
  upline_id uuid,
  name text,
  level user_level,
  xp int,
  streak int,
  journey_step smallint,
  team_count int,
  depth int
)
language sql
stable
security definer
set search_path = public
as $$
  with recursive tree as (
    select p.id, p.upline_id, p.name, p.level, p.xp, p.streak, p.journey_step, p.team_count, 1 as depth
    from profiles p
    where p.upline_id = auth.uid()

    union all

    select p.id, p.upline_id, p.name, p.level, p.xp, p.streak, p.journey_step, p.team_count, t.depth + 1
    from profiles p
    join tree t on p.upline_id = t.id
    where t.depth < p_depth
  )
  select * from tree order by depth, name;
$$;

grant execute on function get_downline(int) to authenticated;
