-- ============================================================
-- LiderTraining — RPC buy_streak_freeze
-- ============================================================
-- Fix: add_xp(-200) rejeita valor negativo. Criamos RPC dedicada
-- que valida saldo, deduz XP e incrementa freezes em uma transação.
-- ============================================================

create or replace function buy_streak_freeze()
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile profiles;
  v_cost int := 200;
begin
  select * into v_profile from profiles where id = auth.uid() for update;

  if v_profile is null then
    raise exception 'Profile not found';
  end if;

  if v_profile.xp < v_cost then
    raise exception 'XP insuficiente (precisa %)', v_cost;
  end if;

  update profiles set
    xp = xp - v_cost,
    freezes = freezes + 1
  where id = auth.uid()
  returning * into v_profile;

  insert into notifications(user_id, type, message, icon)
  values (v_profile.id, 'info', 'Streak Freeze comprado · -' || v_cost || ' XP', 'ac_unit');

  return v_profile;
end;
$$;

grant execute on function buy_streak_freeze() to authenticated;
