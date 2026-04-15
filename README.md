# LiderTraining

Plataforma gamificada de treinamento para consultores de marketing de rede.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS v3
- **Backend:** Supabase (Postgres + Auth + Realtime + RLS)
- **Data fetching:** TanStack Query v5
- **UI state:** Zustand
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **Motion:** Framer Motion
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
  lib/            # supabase client, env, format, cn
  shared/
    hooks/        # hooks transversais (useProfile, etc.)
    layout/       # AppShell, Header, BottomNav
    providers/    # AuthProvider, ToastProvider
    ui/           # design system base
  styles/         # tokens.css + globals.css
  types/          # tipos de domínio e conteúdo

supabase/
  config.toml
  seed.sql
  migrations/     # 4 migrations: schema, rls, functions, seed content

reference/        # HTML monolítico original (não usar, só consulta)
```

## Roadmap

- **Fase 0** — Fundação (feito): setup, design system, auth, schema, RLS
- **Fase 1** — Dashboard + Onboarding + FIR completo
- **Fase 2** — Jornada (10 passos) + Academia
- **Fase 3** — Prospector (CRM)
- **Fase 4** — Ranking + Arena (missões)
- **Fase 5** — Líder + Rede
- **Fase 6** — Polish, perf, SEO, analytics

## Testes manuais de Fase 0

```bash
pnpm typecheck        # compila TS
pnpm lint             # ESLint
pnpm dev              # http://localhost:5173
```

Acessar `/signup/DEMO2026` (se rodou `supabase db reset` com o seed) para testar cadastro por convite.
