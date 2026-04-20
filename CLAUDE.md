# LiderTraining · Memória do Projeto

Este arquivo é carregado automaticamente em toda sessão do Claude Code.
Trata-o como a constituição do projeto: regras que valem sempre.

---

## O projeto em uma frase

Webapp gamificado para consultores de marketing multinível, em React + Vite + Supabase, deploy Vercel. O dono do projeto (Caio) é **estrategista, não desenvolvedor** — explique decisões em linguagem clara, nunca pressuponha conhecimento técnico.

## Stack oficial (não mudar sem pedir)

- **Frontend:** React 18 + Vite + JavaScript (não TypeScript)
- **Backend:** Supabase (auth, database Postgres, storage, edge functions)
- **Deploy:** Vercel com auto-deploy do GitHub (`github.com/lidertraining/Lidertraining` → `lidertraining.vercel.app`)
- **Local:** `C:\Users\caiol\Documents\lidertraining` (Windows, PowerShell)
- **Node.js:** NÃO está instalado localmente. Toda verificação de build acontece via push → Vercel. Não rode `npm run dev` — teste no deploy.
- **MCPs conectados nesta máquina:** Vercel, Supabase, GitHub (use-os livremente antes de pedir informação ao usuário)

## Marca e design

- Nome: **LiderTraining** (nunca "Líder Training" separado)
- Design system: **Amethyst Elite**
  - Obsidian: `#0e0e10` (fundo)
  - Surface: `#131315` / Card: `#1a1a1e` / Chip: `#2a2a2c`
  - Ametista: `#c9a0ff` (accent primário) / dim: `#9b6fd4`
  - Dourado: `#f0c75e` (premium) / Teal: `#5ee6d0` / Verde: `#5ef08a` / Vermelho: `#ff6b8a`
  - Texto: `#e5e1e4` (primário), `#9b97a0` (secundário), `#6b6670` (mute)
- Tipografia: Georgia (serif) para títulos e números grandes; Inter (sans) para corpo
- Estilo: tonal layering (camadas por tom, não por bordas), estética editorial de luxo

## Proibições absolutas

- **NUNCA** mencionar no código ou em UI: Lucas Battistoni, Gigantes, Giga, PlayPro, Hinode (mesmo que o app sirva pra essa rede, o produto é white-label)
- **NUNCA** sobrescrever tabelas existentes no Supabase. Sempre use `CREATE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`. Migrations são aditivas.
- **NUNCA** deletar arquivos sem renomear primeiro para `.old.{ext}`
- **NUNCA** mudar o design system sem autorização explícita

## Estrutura funcional do app (o que já existe, grosso modo)

- **FIR** (Ficha de Início Rápido): onboarding de 8 passos + Lista Viva inicial
- **Jornada**: passo 0 (Mentalidade) + 10 passos (Sonhos → Conecte-se → Metas → Produto → Lista → Convite → Apresentação → Fechamento → Patrocínio → Duplicação). Cada passo com 4 abas: Aprender · Tarefas · Praticar · Agentes. Versão V2 em refactor usa 5 arquétipos (Reflexivo, Planejador, Operacional, Performático, Liderança).
- **Dashboard do Consultor** e **Painel do Líder** (gestão de rede, KPIs, alertas)
- **Ferramentas operacionais**: Smart Prospector, Simulador de Vendas, Smart Contact Uploader (Lista Viva), Biblioteca de Vídeos de Autoridade
- **Sistema de Conhecimento**: tabela `conhecimentos` integrando conteúdos gerados no NotebookLM (áudio, vídeo, mapa mental, report, flashcards, quiz)
- **Central de Áudios** (áudio da semana, grupo, microlearning)
- **Academia Interativa** (estratégia 4P: Aprender → Praticar na plataforma → Executar em campo → Evoluir)

## Tabelas Supabase que provavelmente já existem

Antes de criar migration nova, **use o MCP do Supabase para listar tabelas e inspecionar colunas**. Tabelas esperadas: `profiles`, `conhecimentos`, `progresso_jornada`, `autoridades`, `contextos_video`, `videos_autoridade`, `envios_video`. Pode haver também `prospectos`, `interacoes`, `scripts_mensagens`.

## Como trabalhar neste projeto

1. **Sempre investigue antes de modificar.** Liste arquivos, leia o que existe, use MCPs Supabase e Vercel para descobrir estado real. Não confie em premissas.
2. **Defensivo por padrão.** Tudo aditivo, idempotente, com backup `.old` antes de substituir.
3. **Branches para mudanças grandes.** `feat/nome-curto`, commit por etapa, não empurre para `main` sem pedir.
4. **Commits claros em português.** Formato: `tipo(escopo): descrição curta`. Ex: `feat(auth): adiciona login com biometria`.
5. **Deploy acontece no push.** Não tente testar localmente (sem Node). Após push para `main`, use o MCP da Vercel para verificar o status do deploy e buscar erros de build.
6. **Fale português do Brasil** em toda comunicação com o usuário.
7. **Seja direto e visual.** Caio é não-técnico — use analogias, passos numerados, emojis moderados. Nunca despeje logs sem explicar.
8. **Só pergunte o que realmente precisa.** Se a resposta está no MCP, no código, ou em outro arquivo `.md`, busque você mesmo.

## Regras detalhadas por contexto

Veja `.claude/rules/` para regras específicas de sub-contextos:
- `.claude/rules/workflows.md` — fluxos operacionais (migrations, deploy, erros)
- `.claude/rules/design-system.md` — se existir, padrões visuais detalhados
- Crie novas regras conforme o projeto cresce, sempre curtas e acionáveis

## Arquivos importantes para consultar quando relevantes

- `README.md` do projeto (se existir)
- `package.json` — dependências e scripts reais
- `.env.example` — template de variáveis. O arquivo `.env` real precisa ser criado pela primeira vez (ver workflow em `.claude/rules/workflows.md`)
- `supabase/migrations/` — histórico de mudanças de schema
- `src/components/` e `src/pages/` (ou equivalente) — código da aplicação

## Fluxo de primeira sessão em máquina nova

Quando começar a trabalhar numa sessão, se for **primeira vez** ou se houver sinais de ambiente novo:

1. Rode `git status` para ver estado
2. Confira se existe `.env` (não `.env.example`). Se não existir, siga o workflow em `.claude/rules/workflows.md`
3. Use MCP Supabase para listar tabelas e confirmar que o schema bate com o esperado
4. Use MCP Vercel para ver estado do último deploy
5. Só depois comece a trabalhar no pedido do usuário

## Tom de voz nas respostas

- Direto, visual, confiante
- Sem jargão técnico desnecessário
- Use negrito para destacar pontos críticos
- Emojis com moderação: ✅ ❌ ⚠️ 🚀 📦 para sinalização rápida
- Evite pedidos de desculpa excessivos; se errou, diga o que aconteceu e o próximo passo

---

## Auto-memória

O Claude Code pode acumular aprendizados automáticos (`MEMORY.md` em `~/.claude/projects/`). Isso é OK. Se perceber padrões recorrentes de correção do usuário, registre para não repetir o erro.

---

**Última atualização do briefing:** 20 de abril de 2026
