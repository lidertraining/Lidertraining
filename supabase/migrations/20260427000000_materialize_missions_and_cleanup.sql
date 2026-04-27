-- ============================================================
-- LiderTraining — Materialize User Missions + Cleanup
-- ============================================================
-- Resolve 2 bugs de uma vez:
--
-- 1) user_missions vazia apesar de templates em missions:
--    cria função materialize_user_missions() que materializa
--    user_missions pro auth.uid() chamado, idempotente.
--
-- 2) Tabelas órfãs no banco (consumo_conhecimento, quiz_tentativas):
--    foram criadas em execução antiga e não estão em nenhuma
--    migration do repo. Vazias, seguro dropar.
-- ============================================================

-- ------------------------------------------------------------
-- LIMPEZA — tabelas órfãs (não estão em migration alguma)
-- ------------------------------------------------------------
drop table if exists public.consumo_conhecimento;
drop table if exists public.quiz_tentativas;

-- ------------------------------------------------------------
-- materialize_user_missions()
-- ------------------------------------------------------------
-- Pra cada mission ativa, garante que o auth.uid() tem entry em
-- user_missions. Renova flash/weekly que já expiraram (zerando
-- progress e completed_at, e definindo novo expires_at).
-- Achievements: cria uma vez e nunca renova (sem expiração).
--
-- Função pode ser chamada várias vezes sem efeitos colaterais.
-- ------------------------------------------------------------
create or replace function materialize_user_missions()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_mission record;
  v_existing user_missions;
  v_new_expires timestamptz;
begin
  if v_user is null then
    return;
  end if;

  for v_mission in select * from missions where active = true loop
    -- Calcula novo expires_at por tipo de missão
    v_new_expires := case v_mission.type
      when 'flash' then now() + interval '24 hours'
      -- Weekly expira no domingo às 23:59 (date_trunc('week') retorna segunda 00:00)
      when 'weekly' then date_trunc('week', now()) + interval '7 days'
      else null  -- achievement: sem expiração
    end;

    -- Verifica se já existe entry pra esse user/mission
    select * into v_existing from user_missions
    where user_id = v_user and mission_id = v_mission.id;

    if v_existing is null then
      -- Não tem: cria nova
      insert into user_missions(user_id, mission_id, expires_at, progress, completed_at)
      values (v_user, v_mission.id, v_new_expires, 0, null);

    elsif v_mission.type in ('flash', 'weekly')
          and v_existing.expires_at is not null
          and v_existing.expires_at < now() then
      -- Tem mas expirou: renova
      update user_missions set
        progress = 0,
        completed_at = null,
        expires_at = v_new_expires
      where user_id = v_user and mission_id = v_mission.id;
    end if;
    -- Caso contrário (em andamento, ou achievement já criado): não mexe
  end loop;
end;
$$;

grant execute on function materialize_user_missions() to authenticated;
