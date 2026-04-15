-- ============================================================
-- LiderTraining \u2014 Init Schema
-- ============================================================
-- Cria todas as tabelas do dom\u00ednio + tabelas de conte\u00fado vers\u00edvel.
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
create type user_level as enum ('Master', 'Prata', 'Ouro', 'Diamante', 'Elite');
create type league as enum ('Bronze', 'Prata', 'Ouro', 'Diamante');
create type lead_status as enum ('frio', 'morno', 'quente', 'fechado');
create type team_status as enum ('ativo', 'inativo', 'risco');
create type mission_type as enum ('flash', 'weekly', 'achievement');
create type notif_type as enum ('streak', 'mission', 'league', 'team', 'nba', 'info', 'xp');

-- ------------------------------------------------------------
-- PROFILES (extends auth.users)
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  upline_id uuid references profiles(id) on delete set null,
  name text not null,
  avatar_url text,

  -- gamification
  xp integer not null default 0 check (xp >= 0),
  level user_level not null default 'Master',
  streak integer not null default 0,
  last_active date,
  streak_freeze_active boolean not null default false,
  freezes integer not null default 1,
  energy smallint not null default 5 check (energy between 0 and 10),
  max_energy smallint not null default 5,
  energy_last_refill timestamptz not null default now(),
  league league not null default 'Bronze',
  weekly_xp integer not null default 0,

  -- progress
  journey_step smallint not null default 0 check (journey_step between 0 and 11),
  fir_completed boolean not null default false,
  fir_step smallint not null default 0 check (fir_step between 0 and 8),
  onboarded boolean not null default false,

  -- business metrics
  contacts integer not null default 0,
  sales integer not null default 0,
  team_count integer not null default 0,
  pg numeric not null default 0,
  pp numeric not null default 0,
  vip integer not null default 0,
  comm_current numeric not null default 0,
  comm_projected numeric not null default 0,
  comm_goal numeric not null default 5000,

  -- scout (10 eixos) como jsonb para evoluir
  scout jsonb not null default '[5,5,5,5,5,5,5,5,5,5]'::jsonb,

  -- meta
  role text not null default 'consultant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_upline_idx on profiles(upline_id);
create index profiles_league_weekly_idx on profiles(league, weekly_xp desc);

-- ------------------------------------------------------------
-- INVITE CODES
-- ------------------------------------------------------------
create table invite_codes (
  code text primary key,
  owner_id uuid not null references profiles(id) on delete cascade,
  max_uses integer not null default 1 check (max_uses >= 1),
  uses integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index invite_codes_owner_idx on invite_codes(owner_id);

-- ------------------------------------------------------------
-- LEADS (CRM)
-- ------------------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  phone text,
  status lead_status not null default 'frio',
  source text not null default 'Lista quente',
  score smallint not null default 50 check (score between 0 and 100),
  step text default 'Novo contato',
  last_contact timestamptz,
  notes text,
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index leads_user_status_idx on leads(user_id, status);

-- ------------------------------------------------------------
-- MISSIONS (templates)
-- ------------------------------------------------------------
create table missions (
  id text primary key,
  name text not null,
  description text not null,
  type mission_type not null,
  target integer not null,
  reward_xp integer not null,
  duration_seconds integer,
  requirements jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- USER_MISSIONS (inst\u00e2ncias por usu\u00e1rio)
create table user_missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  mission_id text not null references missions(id) on delete cascade,
  progress integer not null default 0,
  completed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, mission_id)
);
create index user_missions_user_idx on user_missions(user_id, completed_at);

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notif_type not null,
  message text not null,
  icon text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_read_idx on notifications(user_id, read, created_at desc);

-- FEED EVENTS
create table feed_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  actor_name text not null,
  action text not null,
  icon text not null default 'star',
  visibility text not null default 'self_and_downline',
  created_at timestamptz not null default now()
);
create index feed_events_user_created_idx on feed_events(user_id, created_at desc);

-- ------------------------------------------------------------
-- CONTE\u00daDO EST\u00c1TICO (vers\u00edvel)
-- ------------------------------------------------------------
create table journey_steps (
  id smallint primary key,
  name text not null,
  icon text not null,
  color text not null,
  description text not null,
  version integer not null default 1
);

create table audios (
  id text primary key,
  title text not null,
  duration_seconds integer not null,
  url text,
  order_idx smallint not null
);

create table objections (
  id smallint primary key generated always as identity,
  objection text not null,
  response text not null,
  order_idx smallint not null
);

create table icebreakers (
  id smallint primary key generated always as identity,
  text text not null,
  order_idx smallint not null
);

create table closing_laws (
  id smallint primary key generated always as identity,
  name text not null,
  description text not null,
  icon text not null,
  example text not null,
  order_idx smallint not null
);

create table closing_scripts (
  id smallint primary key generated always as identity,
  name text not null,
  template text not null,
  order_idx smallint not null
);

create table golden_rules (
  id smallint primary key generated always as identity,
  rule text not null,
  order_idx smallint not null
);

create table one_on_one_plan (
  id smallint primary key generated always as identity,
  step text not null,
  order_idx smallint not null
);

create table fir_steps (
  id smallint primary key,
  title text not null,
  reward_xp integer not null,
  order_idx smallint not null
);

create table presentation_formats (
  id smallint primary key generated always as identity,
  format text not null,
  order_idx smallint not null
);

-- ------------------------------------------------------------
-- PROGRESSO DO USU\u00c1RIO EM CONTE\u00daDO
-- ------------------------------------------------------------
create table audio_progress (
  user_id uuid not null references profiles(id) on delete cascade,
  audio_id text not null references audios(id) on delete cascade,
  completed boolean not null default false,
  progress_seconds integer not null default 0,
  completed_at timestamptz,
  primary key (user_id, audio_id)
);

create table step_notes (
  user_id uuid not null references profiles(id) on delete cascade,
  step_id smallint not null,
  content text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, step_id)
);

-- ------------------------------------------------------------
-- TRIGGER: updated_at
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

create trigger leads_updated_at before update on leads
  for each row execute function set_updated_at();
