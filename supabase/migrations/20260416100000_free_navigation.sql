-- ============================================================
-- LiderTraining — Free navigation: passos em qualquer ordem
-- ============================================================
-- Introduz bitmasks journey_done_mask e fir_done_mask para
-- marcar cada passo como concluído de forma independente.
-- Os campos journey_step e fir_step passam a ser "ponto mais
-- avançado" (apenas para compatibilidade de UI existente).
-- ============================================================

alter table profiles
  add column if not exists journey_done_mask int not null default 0,
  add column if not exists fir_done_mask int not null default 0;

-- Backfill: quem já estava no passo N da jornada tem bits 0..N-1 marcados.
update profiles
set journey_done_mask = case
  when journey_step <= 0 then 0
  else (1 << journey_step) - 1
end
where journey_done_mask = 0;

-- FIR é 1-indexed: quem está no passo N tem bits 0..N-1 (passos 1..N).
update profiles
set fir_done_mask = case
  when fir_step <= 0 then 0
  else (1 << fir_step) - 1
end
where fir_done_mask = 0;

-- Grant de escrita segue indireto (via RPC security definer).
-- Mantemos fir_step/fir_completed no grant para não quebrar fluxo antigo.

-- ------------------------------------------------------------
-- complete_journey_step — aceita qualquer passo 0..11, idempotente
-- ------------------------------------------------------------
create or replace function complete_journey_step(p_step smallint)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile profiles;
  v_bit int;
  v_already_done boolean;
begin
  if p_step < 0 or p_step > 11 then
    raise exception 'invalid journey step';
  end if;

  v_bit := 1 << p_step;

  select * into v_profile from profiles where id = auth.uid();

  v_already_done := (coalesce(v_profile.journey_done_mask, 0) & v_bit) <> 0;
  if v_already_done then
    return v_profile;
  end if;

  update profiles set
    journey_done_mask = coalesce(journey_done_mask, 0) | v_bit,
    journey_step = greatest(journey_step, (p_step + 1)::smallint)
  where id = auth.uid();

  perform add_xp(100, 'Passo ' || p_step);
  select * into v_profile from profiles where id = auth.uid();
  return v_profile;
end;
$$;

grant execute on function complete_journey_step(smallint) to authenticated;

-- ------------------------------------------------------------
-- complete_fir_step — aceita qualquer passo 1..8, idempotente
-- ------------------------------------------------------------
create or replace function complete_fir_step(p_step smallint, p_reward int default 50)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile profiles;
  v_bit int;
  v_new_mask int;
  v_already_done boolean;
begin
  if p_step < 1 or p_step > 8 then
    raise exception 'invalid fir step';
  end if;

  v_bit := 1 << (p_step - 1);

  select * into v_profile from profiles where id = auth.uid();

  v_already_done := (coalesce(v_profile.fir_done_mask, 0) & v_bit) <> 0;
  if v_already_done then
    return v_profile;
  end if;

  v_new_mask := coalesce(v_profile.fir_done_mask, 0) | v_bit;

  update profiles set
    fir_done_mask = v_new_mask,
    fir_step = greatest(fir_step, p_step::smallint),
    fir_completed = (v_new_mask = 255)
  where id = auth.uid();

  perform add_xp(p_reward, 'FIR passo ' || p_step);
  select * into v_profile from profiles where id = auth.uid();
  return v_profile;
end;
$$;

grant execute on function complete_fir_step(smallint, int) to authenticated;
