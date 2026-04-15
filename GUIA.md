# Guia passo a passo — do zero ao app rodando

Este guia parte do zero. Siga na ordem. Se algum passo falhar, pule para a seção **Solução de problemas** no final.

---

## 0. Pré-requisitos — instalar uma vez

Confira se tem na sua máquina:

```bash
node --version    # precisa ser >= 20 (ideal 22)
pnpm --version    # qualquer versão recente
git --version
curl --version
```

Se faltar algum:

- **Node 22**: https://nodejs.org → baixe o LTS
- **pnpm**: `npm install -g pnpm`
- **git**: https://git-scm.com/downloads
- **curl**: já vem no Mac/Linux; Windows: use Git Bash ou WSL

> Docker e Supabase CLI **não são obrigatórios** neste fluxo online. Só precisa se for rodar Supabase localmente.

---

## 1. Revogar o token exposto (segurança)

Você colou um Personal Access Token no chat. Para evitar riscos, **revogue agora**:

1. Abra https://supabase.com/dashboard/account/tokens
2. Encontre o token `sbp_7ded91ee...` (ou qualquer outro que tenha compartilhado)
3. Clique em **Revoke** ao lado dele
4. Confirme

Não precisa gerar um novo ainda — faremos no passo 4.

---

## 2. Clonar o repositório

Abra o terminal e rode:

```bash
git clone <url-do-seu-repo>       # substitua pela URL real do lidertraining/Lidertraining
cd Lidertraining
git checkout claude/restructure-planning-sQbVf
git pull origin claude/restructure-planning-sQbVf
```

> Se ainda não tem o repo clonado, peça ao admin do GitHub o acesso/URL.

---

## 3. Instalar dependências

```bash
pnpm install
```

Espera ~30 s. Vai instalar 441 pacotes (React, Vite, Supabase, TanStack Query, Tailwind, etc.).

Se aparecer um aviso sobre "Ignored build scripts: esbuild" pode ignorar.

---

## 4. Gerar um Personal Access Token NOVO

> O token só é usado uma vez, pelo script. Você pode revogar logo depois.

1. Abra https://supabase.com/dashboard/account/tokens
2. Clique em **Generate new token**
3. Nome sugerido: `lidertraining-setup-2026`
4. Copie o token exibido (começa com `sbp_`) — ele **só aparece uma vez**
5. Deixe essa janela aberta até terminar o passo 5

---

## 5. Rodar o setup online

Ainda no terminal, na raiz do projeto:

```bash
pnpm setup:online
```

O script vai te guiar. Vai pedir, nesta ordem:

### 5.1 Token

```
Cole aqui (formato sbp_...):
```

Cole o token que você copiou no passo 4 e dê Enter. Ele não aparece na tela (é oculto por segurança).

### 5.2 Organização

O script lista suas orgs. Exemplo:

```
[1] aabbccdd1234             Minha Org Pessoal
[2] xxyyzz0987               Empresa X

Número da org (ou cole o ID):
```

Digite `1` (ou o número correspondente) e Enter.

### 5.3 Nome do projeto

```
Nome do projeto [lidertraining]:
```

Pressione Enter para aceitar o padrão (`lidertraining`) ou digite outro nome.

### 5.4 Região

```
Região [sa-east-1]:
```

`sa-east-1` é São Paulo (melhor para Brasil). Pressione Enter.

Outras regiões comuns: `us-east-1` (Virgínia), `eu-west-1` (Irlanda), `ap-southeast-1` (Singapura).

### 5.5 Senha do Postgres

O script **gera automaticamente** uma senha aleatória e mostra na tela. Anote em algum lugar seguro (1Password, keepass, etc.) — você só vai precisar dela se for acessar o banco via `psql` algum dia.

### 5.6 Aguardar provisionamento

```
Aguardando provisionamento (2-4 min)…
  [ 1/36] COMING_UP
  [ 2/36] COMING_UP
  ...
  [ 8/36] ACTIVE_HEALTHY
```

O script faz polling a cada 10 s. Quando aparecer `ACTIVE_HEALTHY`, segue automaticamente.

### 5.7 Aplicar migrations

```
Aplicando migrations…
  → 20260415000000_init_schema.sql
  → 20260415000100_rls_policies.sql
  → 20260415000200_functions_triggers.sql
  → 20260415000300_seed_content.sql
✓ Migrations aplicadas
```

Se alguma falhar, o script para e mostra o erro.

### 5.8 Seed opcional

```
Aplicar supabase/seed.sql (cria user root + invite DEMO2026)? [y/N]
```

Digite `y` + Enter. Isso cria:
- Um usuário admin `root@lidertraining.dev` (senha `senha123`)
- Um código de convite `DEMO2026` com 100 usos e 1 ano de validade

> **Em produção real**, responda `N` e crie o admin manualmente depois.

### 5.9 Fim

```
✓ Setup online completo!

Project ref:     abcd1234xyz
Dashboard:       https://supabase.com/dashboard/project/abcd1234xyz
URL:             https://abcd1234xyz.supabase.co
```

Anote o **Project ref** — você pode precisar dele mais tarde.

O arquivo `.env.local` foi criado automaticamente na raiz do projeto com a URL e anon key corretos.

---

## 6. Revogar o token (segurança)

Volte em https://supabase.com/dashboard/account/tokens e clique **Revoke** no token que você criou no passo 4. Ele já cumpriu o propósito.

---

## 7. Rodar o app

```bash
pnpm dev
```

Saída esperada:

```
  VITE v5.4.21  ready in 450 ms

  ➜  Local:   http://localhost:5173/
```

Abra http://localhost:5173/ no navegador. Como você ainda não está logado, vai redirecionar para `/login`.

---

## 8. Testar o cadastro via convite

No navegador, abra:

```
http://localhost:5173/signup/DEMO2026
```

Você vê:

> **LiderTraining**
> Você foi convidado por **Root Admin**

Preencha:
- **Nome:** seu nome
- **Email:** seu email (pode ser um Gmail real)
- **Senha:** mínimo 6 caracteres
- **Confirmar senha:** igual

Clique em **Criar conta**.

### Confirmação de email

Por padrão, o Supabase envia um email de confirmação. Duas opções:

**Opção A — Desligar confirmação (dev):**
1. Dashboard → Authentication → Providers → Email
2. Desmarque **Confirm email**
3. Save

**Opção B — Confirmar manualmente:**
1. Dashboard → Authentication → Users
2. Ache seu usuário → "..." → **Confirm user**

Depois faça login em http://localhost:5173/login com o mesmo email/senha.

---

## 9. Fluxo de teste end-to-end

Siga essa sequência para validar que tudo funciona:

| Passo | Ação | Esperado |
|---|---|---|
| 1 | Logar | Redireciona para `/onboarding` |
| 2 | Digitar nome → Continuar | Vai para `/fir` |
| 3 | Clicar **Feito** em 1 etapa do FIR | +XP aparece como toast |
| 4 | Clicar **Pular** | Vai para `/` (dashboard) |
| 5 | Dashboard | Mostra NBA, stats, XP bar, comissão, quick actions, feed |
| 6 | `/prospector` → Adicionar lead | +15 XP toast + card aparece |
| 7 | Clicar no lead → mudar status para **Quente** → Salvar | Score muda para 80 |
| 8 | `/journey` | Trilha com 11 passos, só o passo 0 destacado |
| 9 | Clicar no passo 0 → aba **Aprender** → **Revisei** | +10 XP |
| 10 | Clicar **Concluir passo** | +100 XP, passo 1 vira current |
| 11 | `/academy` | Áudios, VIP 600, Regras, MOS, 1x1 |
| 12 | Clicar **+25 XP** em um áudio | Marca como ouvido |
| 13 | `/ranking` | Você aparece na liga Bronze |
| 14 | `/arena` | Missões flash + 21 dias |
| 15 | `/leader` → `/network` | Árvore (você é a raiz, Root Admin é upline) |

---

## 10. (Opcional) Gerar tipos TypeScript fortes

Enquanto `src/types/database.ts` for o stub permissivo, o client Supabase não tem tipos fortes. Para ativar:

```bash
npx supabase gen types typescript --project-id <SEU_PROJECT_REF> > src/types/database.ts
```

Depois, abra `src/lib/supabase.ts` e:
1. Descomente a linha `import type { Database } from '@ltypes/database';`
2. Troque `createClient(...)` por `createClient<Database>(...)`
3. Salve

Agora todas as queries do Supabase são fortemente tipadas.

---

## 11. (Opcional) Desligar confirmação de email

Durante o desenvolvimento, confirmação de email atrasa testes. Para desligar:

1. Dashboard do projeto → **Authentication** → **Providers**
2. Clique em **Email**
3. Desmarque **Confirm email**
4. **Save**

Agora usuários novos já entram direto sem precisar confirmar email.

---

## 12. Deploy (quando estiver pronto)

Esta parte é opcional, deixa para quando quiser publicar.

### Vercel (recomendado)

1. https://vercel.com → **Add New Project**
2. Importe o repositório `lidertraining/Lidertraining`
3. Framework preset: **Vite**
4. Environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL` (URL do deploy, ex: `https://lidertraining.vercel.app`)
   - `VITE_APP_NAME=LiderTraining`
5. Deploy

### Configurar redirect URLs no Supabase

Depois do deploy, no dashboard do Supabase:
1. **Authentication** → **URL Configuration**
2. **Site URL:** URL do deploy
3. **Redirect URLs:** adicione a URL do deploy

---

## Solução de problemas

### "Token inválido"

O token precisa começar com `sbp_`. Gere um novo em https://supabase.com/dashboard/account/tokens.

### "Host not in allowlist"

Você está rodando o script no sandbox do Claude Code. Copie o repositório para a sua máquina e rode ali.

### Projeto não fica ACTIVE_HEALTHY

Às vezes o Supabase demora mais. Abra o dashboard do projeto e veja se está **Paused** (planos gratuitos pausam após 7 dias de inatividade). Clique em **Restore** no dashboard e rode novamente `supabase/migrations/*` manualmente via SQL Editor.

### Migrations falham por "type already exists"

O script tenta aplicar tudo do zero. Se você rodou antes, vá no SQL Editor do Supabase e rode:

```sql
drop schema public cascade;
create schema public;
grant all on schema public to postgres, anon, authenticated, service_role;
```

Depois rode `pnpm setup:online` novamente.

### `pnpm dev` mostra "Env inválida"

Abra `.env.local` e confira que tem 4 linhas válidas:

```
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=LiderTraining
```

### Login não funciona ("Invalid credentials")

- Confirme que o usuário existe no dashboard (**Authentication** → **Users**)
- Confirme email ou desligue a confirmação (seção 11)

### "Missing RPC signup_with_invite"

Migrations não foram aplicadas. Rode novamente:

```bash
pnpm setup:online
```

(responde Y quando perguntar pelo seed, e ignore erro de seed já existente)

---

## Referência rápida de comandos

```bash
pnpm install          # instala deps
pnpm setup:online     # cria projeto Supabase + migrations + .env
pnpm dev              # dev server
pnpm build            # build produção
pnpm typecheck        # TS
pnpm lint             # ESLint
pnpm preview          # preview do build
```

---

## Onde pedir ajuda

- Issues do projeto: https://github.com/lidertraining/Lidertraining/issues
- Supabase docs: https://supabase.com/docs
- Discord Supabase (tem canal em português): https://discord.supabase.com
