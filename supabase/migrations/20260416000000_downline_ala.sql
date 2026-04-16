-- ============================================================
-- LiderTraining — Ala da Downline
-- ============================================================
-- 1) profiles.personal_code: código único e permanente por consultor
--    auto-gerado no insert (ou quando signup_with_invite roda)
-- 2) RPC generate_downline_invite_code(downline_id): líder gera convite
--    em nome de alguém da sua downline (fica vinculado ao downline)
-- 3) RPC get_team_learning: progresso de aprendizado de toda a downline
--    (journey_step, fir_step, audios_done, leads_total, last_active)
-- ============================================================

-- ------------------------------------------------------------
-- 1) personal_code em profiles
-- ------------------------------------------------------------
alter table profiles
  add column if not exists personal_code text unique;

create or replace function generate_personal_code()
returns text
language plpgsql
volatile
as $$
declare
  v_code text;
  v_exists boolean;
  v_attempts int := 0;
begin
  loop
    -- código de 7 caracteres alfanuméricos maiúsculos
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 7));
    select exists(select 1 from profiles where personal_code = v_code) into v_exists;
    exit when not v_exists;
    v_attempts := v_attempts + 1;
    if v_attempts > 10 then
      raise exception 'Não foi possível gerar código único';
    end if;
  end loop;
  return v_code;
end;
$$;

-- Trigger: auto-gerar personal_code ao inserir profile
create or replace function set_personal_code_on_insert()
returns trigger
language plpgsql
as $$
begin
  if new.personal_code is null then
    new.personal_code := generate_personal_code();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profile_personal_code on profiles;
create trigger trg_profile_personal_code
  before insert on profiles
  for each row execute function set_personal_code_on_insert();

-- Backfill: preencher profiles já existentes sem personal_code
update profiles
set personal_code = generate_personal_code()
where personal_code is null;

-- Também criar um invite_code permanente para cada profile existente,
-- linkado ao personal_code. Isso permite que /signup/CODIGO funcione.
insert into invite_codes (code, owner_id, max_uses, uses, expires_at)
select
  p.personal_code,
  p.id,
  999999,  -- praticamente ilimitado
  0,
  null     -- sem expiração
from profiles p
where p.personal_code is not null
  and not exists (select 1 from invite_codes ic where ic.code = p.personal_code);

-- Atualizar signup_with_invite para criar invite_code pessoal automaticamente
-- quando o profile é criado
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

  -- Criar invite_code permanente vinculado ao personal_code do novo profile
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

grant execute on function signup_with_invite(text, text) to authenticated;

-- ------------------------------------------------------------
-- 2) RPC generate_downline_invite_code(downline_id)
-- Permite que um líder compartilhe um convite EM NOME de alguém da
-- sua downline (útil para o gerente recrutar para um consultor júnior).
-- O novo consultor fica vinculado ao downline_id escolhido, não ao líder.
-- ------------------------------------------------------------
create or replace function generate_downline_invite_code(p_downline_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_is_ancestor boolean;
  v_personal text;
begin
  -- Valida que p_downline_id é mesmo da downline do caller
  select is_ancestor_of(auth.uid(), p_downline_id) into v_is_ancestor;

  -- Permite também que o próprio usuário pegue o código dele
  if not v_is_ancestor and p_downline_id <> auth.uid() then
    raise exception 'Não autorizado';
  end if;

  -- Retorna o personal_code do downline (sempre o mesmo)
  select personal_code into v_personal from profiles where id = p_downline_id;
  if v_personal is null then
    raise exception 'Consultor sem código pessoal';
  end if;

  return v_personal;
end;
$$;

grant execute on function generate_downline_invite_code(uuid) to authenticated;

-- ------------------------------------------------------------
-- 3) RPC get_team_learning: progresso de aprendizado da equipe
-- ------------------------------------------------------------
create or replace function get_team_learning(p_depth int default 6)
returns table (
  id uuid,
  upline_id uuid,
  name text,
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

-- ------------------------------------------------------------
-- Index para performance
-- ------------------------------------------------------------
create index if not exists profiles_personal_code_idx on profiles(personal_code);
