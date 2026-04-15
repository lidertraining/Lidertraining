-- ============================================================
-- Seed de desenvolvimento local
-- ============================================================
-- Para uso com `supabase db reset`.
-- Cria um usu\u00e1rio admin "root" + c\u00f3digo de convite de exemplo.
-- ============================================================

-- Criar usu\u00e1rio root diretamente via auth.users (apenas dev local)
-- Em prod, use o fluxo de signup + signup_with_invite.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'root@lidertraining.dev',
  crypt('senha123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Root Admin"}'
)
on conflict (id) do nothing;

-- Profile root sem upline
insert into profiles (id, upline_id, name, role, onboarded, fir_completed, xp, level, league)
values (
  '00000000-0000-0000-0000-000000000001',
  null,
  'Root Admin',
  'admin',
  true,
  true,
  25000,
  'Elite',
  'Diamante'
)
on conflict (id) do nothing;

-- C\u00f3digo de convite de exemplo
insert into invite_codes (code, owner_id, max_uses, uses, expires_at)
values (
  'DEMO2026',
  '00000000-0000-0000-0000-000000000001',
  100,
  0,
  now() + interval '1 year'
)
on conflict (code) do nothing;
