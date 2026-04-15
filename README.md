# LiderTraining

Plataforma gamificada de treinamento para consultores de marketing de rede.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS v3
- **Backend:** Supabase (Postgres + Auth + Realtime + RLS)
- **Data fetching:** TanStack Query v5 (com realtime via `postgres_changes`)
- **UI state:** React state + Zustand (quando necessário)
- **Routing:** React Router v6 com code-split por rota
- **Forms:** React Hook Form + Zod
- **Motion:** Framer Motion (modais) + CSS (cascata)
- **Auth:** Convite por upline (código/link do patrocinador)

## Setup

```bash
# Dependências
pnpm install

# Env
cp .env.example .env.local
# edite VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# Supabase local (opcional)
pnpm supabase:start
pnpm supabase:types  # gera src/types/database.ts

# Dev server
pnpm dev
```

## Estrutura

```
src/
  config/         # rotas e constantes
  content/        # fallback de conteúdo estático (STEPS, OBJECTIONS, etc.)
  features/       # features por domínio (auth, dashboard, journey, ...)
    auth/         # login, signup por convite, guards
    onboarding/   # boas-vindas pós-cadastro
    fir/          # First Introduction Reality (8 etapas)
    dashboard/    # hero, NBA, stats, carreira, comissão, flash
    journey/      # 10 passos com 4 abas
    academy/      # áudios, VIP 600, regras, MOS, 1x1
    prospector/   # CRM de leads
    ranking/      # leaderboard por liga + pódio
    arena/        # missões flash, achievements, 21 dias
    leader/       # painel de gestão de equipe
    network/      # árvore genealógica (até 6 níveis)
    profile/      # perfil, scout, sign out
    notifications/
    feed/
    missions/
    gamification/ # addXP, streakTick, useAddXP, XPBar
  lib/            # supabase client, env, format, cn, relativeTime
  shared/
    hooks/        # useProfile
    layout/       # AppShell, Header, BottomNav, BackButton, ErrorBoundary
    providers/    # AuthProvider, ToastProvider
    ui/           # design system base (14 componentes)
  styles/         # tokens.css + globals.css
  types/          # domain, content, database (gerado)

supabase/
  config.toml
  seed.sql        # user root + invite DEMO2026
  migrations/     # 4 migrations: schema, rls, functions, seed content

reference/        # HTML monolítico original (não usar, só consulta)
public/
  robots.txt      # libera apenas /, bloqueia rotas privadas
```

## Arquitetura

**Features-first.** Cada feature é autossuficiente: `api/`, `components/`, `hooks/`, `routes/`, `schemas.ts`. Features nunca importam entre si — apenas via `shared/` ou `content/`.

**Gamificação server-authoritative.** Toda mutação de XP, streak, energia e avanço de passo passa por RPCs `SECURITY DEFINER` no Postgres. Nenhum UPDATE direto em `profiles.xp` é permitido (RLS + `GRANT UPDATE` por coluna).

**RLS MLM.** Função `is_ancestor_of(ancestor, descendant)` usa CTE recursiva sobre `profiles.upline_id` para autorizar leitura descendente. Cada consultor vê o próprio perfil + toda sua downline; leads são 100% privados ao dono.

**Code-split.** Cada rota usa `React.lazy()` com `Suspense` fallback (`PageSpinner`). Auth é eager para zerar latência da tela de login.

**Fallback gracioso.** Conteúdo estático (objeções, icebreakers, scripts) vem do Supabase mas usa `src/content/*.ts` como fallback imediato se a query falhar — app nunca fica sem conteúdo.

## Roadmap

- **Fase 0** — Fundação ✅
- **Fase 1** — Dashboard + FIR + gamification hooks ✅
- **Fase 2** — Jornada (10 passos) + Academia ✅
- **Fase 3** — Prospector (CRM) ✅
- **Fase 4** — Ranking + Arena (missões) ✅
- **Fase 5** — Líder + Rede ✅
- **Fase 6** — Polish (error boundary, code-split, SEO) ✅

## Verificação

```bash
pnpm typecheck        # compila TS
pnpm lint             # ESLint
pnpm build            # build de produção
pnpm dev              # http://localhost:5173
```

Fluxo de teste end-to-end:

1. `pnpm supabase:start` e `supabase db reset` para aplicar migrations + seed
2. Acessar `/signup/DEMO2026` — cadastro via convite do root admin
3. Preencher onboarding → FIR → dashboard
4. Adicionar lead → +15 XP aparece como toast e no feed
5. Marcar status=fechado → +50 XP
6. Concluir passo da jornada → +100 XP
7. Abrir `/ranking` → aparece na liga Bronze

## Supabase — RPCs críticas

| RPC | Descrição |
|---|---|
| `signup_with_invite(code, name)` | Cria profile com upline_id do dono do código |
| `add_xp(amount, reason)` | Único canal de mutação de XP; auto-promove nível |
| `complete_journey_step(step)` | Avança passo + concede +100 XP atomicamente |
| `tick_streak()` | Incrementa streak em novo dia (com freeze) |
| `refill_energy()` | Recarrega energia (1/hora, cap max_energy) |
| `get_downline(depth)` | Árvore genealógica recursiva até N níveis |
| `is_ancestor_of(a, d)` | Helper para RLS (não chamada direto) |
