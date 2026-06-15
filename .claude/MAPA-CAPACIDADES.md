# 🗺️ Mapa de Capacidades — Claude Code no LiderTraining

> **O que é isto:** o inventário vivo de tudo que o Claude tem ligado nesta conta —
> ferramentas nativas, subagentes, skills e MCPs/conectores. Serve para o Claude
> **combinar as capacidades certas antes de cada tarefa**, sem depender de o Caio lembrar
> o que está instalado.
>
> **Regra de ouro (Protocolo Pré-Tarefa):** antes de executar qualquer pedido, o Claude
> consulta este mapa, identifica quais skills/MCPs servem à tarefa, ativa-os (via
> `ToolSearch` quando preciso) e só então executa.
>
> ⚠️ **Este arquivo é commitado de propósito.** O ambiente do Claude na nuvem é efêmero:
> tudo que não está salvo no repositório some entre uma sessão e outra. É por isso que o
> mapa anterior se perdeu — ele nunca chegou a ser commitado. Este mora aqui para nunca
> mais sumir.
>
> _Última verificação do inventário: 15/06/2026._

---

## 🚦 Protocolo Pré-Tarefa — rodar mentalmente antes de QUALQUER tarefa

1. **Classifico** a tarefa: é banco? deploy? design? conteúdo? pesquisa? código? revisão? automação?
2. **Cruzo** com o mapa abaixo: qual a melhor skill / MCP / subagente para isto?
3. **Ativo** o que falta: `ToolSearch` para carregar o MCP/ferramenta certo *antes* de chamá-lo
   (MCPs e várias ferramentas chegam "adormecidos" e só ficam chamáveis depois do `ToolSearch`).
4. **Executo** combinando capacidades — nunca fico só no básico quando existe ferramenta melhor.

### Atalho tarefa → capacidade

| Se a tarefa é... | Use... |
|---|---|
| Mexer em banco / schema / RLS / migration | MCP **Supabase** (sempre `list_tables` **antes** de criar nada) |
| Conferir deploy / erro de build | MCP **Vercel** |
| PR, issue, CI, busca de código no GitHub | MCP **GitHub** |
| Criar/integrar tela, design system, diagrama | MCP **Figma** / **Canva** + `.claude/rules/design-system.md` |
| Gerar imagem, vídeo, áudio, 3D | MCP **Higgsfield** |
| Documento, base de conhecimento, planilha, e-mail | MCP **Notion** / **Google Drive** / **Gmail** |
| Gravação/transcrição de reunião | MCP **Zoom** |
| Pesquisa profunda com fontes citadas | Skill **deep-research** |
| Revisar código antes de pushar | Skill **code-review** → **simplify** → **security-review** |
| Confirmar que o app funciona de verdade | Skill **verify** / **run** |
| Tarefa recorrente / monitorar PR | Skill **loop** / `subscribe_pr_activity` |
| Criar comportamento automático (hook/permissão) | Skill **update-config** |
| Dúvida sobre o próprio Claude Code / API Claude | Subagente **claude-code-guide** / skill **claude-api** |

---

## 🧰 1. Ferramentas nativas (sempre disponíveis)

| Ferramenta | Para quê |
|---|---|
| **Read / Write / Edit** | Ler, criar e editar arquivos |
| **Glob / Grep** | Buscar arquivos por nome e por conteúdo (use estas, não `find`/`grep` no Bash) |
| **Bash** | Terminal: git, pnpm, scripts |
| **ToolSearch** | **Carregar** sob demanda ferramentas/MCPs adormecidos — passo-chave do protocolo |
| **Agent** | Disparar subagentes (ver seção 2) |
| **Skill** | Invocar uma skill (ver seção 3) |
| **WebSearch / WebFetch** | Buscar e ler conteúdo da web |
| **SendUserFile** | Entregar um arquivo pronto ao Caio (relatório, imagem, build) |
| **AskUserQuestion** | Perguntar com opções quando há ambiguidade real |
| Monitor · NotebookEdit · TaskOutput/Stop · PushNotification · ExitPlanMode | Utilitários de apoio |

## 🤖 2. Subagentes (via `Agent`)

| Subagente | Para quê |
|---|---|
| **Explore** | Varredura ampla e read-only de muitos arquivos; devolve a conclusão, não o despejo |
| **Plan** | Desenhar plano de implementação de uma tarefa maior |
| **general-purpose** / **claude** | Tarefas multi-step e buscas abertas |
| **claude-code-guide** | Dúvidas sobre o próprio Claude Code, SDK e API Claude |
| **statusline-setup** | Configurar a status line |

## ⚡ 3. Skills instaladas (via `Skill`)

| Skill | Para quê |
|---|---|
| **deep-research** | Pesquisa profunda multi-fonte com verificação e citações |
| **code-review** | Caça bugs de correção no diff atual |
| **simplify** | Limpeza de qualidade (reuso, simplificação, eficiência) no diff |
| **security-review** | Revisão de segurança das mudanças pendentes |
| **verify** | Roda o app e observa o comportamento para confirmar que a mudança funciona |
| **run** | Sobe o app para ver a mudança funcionando |
| **review** | Revisa um Pull Request |
| **init** | Cria/atualiza o `CLAUDE.md` |
| **update-config** | Configura `settings.json`: hooks, permissões, env vars |
| **session-start-hook** | Cria hooks de início de sessão (Claude Code na web) |
| **fewer-permission-prompts** | Monta allowlist para reduzir pedidos de permissão |
| **keybindings-help** | Customiza atalhos de teclado |
| **loop** | Roda um prompt/comando em intervalo recorrente |
| **claude-api** | Referência da API Claude (modelos, preços, tool use, caching) |

## 🔌 4. MCPs / Conectores (carregar via `ToolSearch` antes de usar)

### Núcleo do LiderTraining
| MCP | Para quê |
|---|---|
| **Supabase** | Banco Postgres, auth, migrations, edge functions, logs, advisors, tipos TS |
| **Vercel** | Deploys, logs de build, projetos, domínios |
| **GitHub** | PRs, issues, code search, commits, branches, CI/Actions |

### Conteúdo & design
| MCP | Para quê |
|---|---|
| **Figma** | Design ↔ código, telas, design system, diagramas (FigJam) |
| **Canva** | Criar/editar designs, exportar, brand templates |
| **Higgsfield** | Gerar imagem, vídeo, áudio, 3D; análise de viralidade |

### Produtividade & dados
| MCP | Para quê |
|---|---|
| **Notion** | Páginas, bancos de dados, documentação |
| **Google Drive** | Buscar, ler e criar arquivos no Drive |
| **Gmail** | Threads, rascunhos, labels |
| **Zoom** | Gravações, transcrições, assets de reunião |
| **HubSpot** | CRM, contatos, campanhas |

### Outros (disponíveis, uso pontual)
| MCP | Para quê |
|---|---|
| **AWS Marketplace** | Pesquisar soluções do marketplace |
| **Uber** | Estimativas de corrida |

---

## 🔁 Como manter este mapa vivo

- Sempre que um MCP/skill **novo** aparecer (ou sumir), atualizar este arquivo na mesma sessão.
- **O que garante o protocolo sem depender de memória:** a regra está fixada no `CLAUDE.md`
  (seção "Protocolo de capacidades"), e o `CLAUDE.md` é carregado automaticamente em toda
  sessão. Ou seja: toda sessão começa lembrando de consultar este mapa antes de agir.
- **Reforço opcional (só com autorização do Caio):** dá para adicionar um hook de início de
  sessão que exibe um resumo deste mapa automaticamente. Como é um script auto-executável,
  só entra com o "ok" explícito.
- **Para replicar em outro repositório:** copie `.claude/MAPA-CAPACIDADES.md` e o bloco da
  seção "Protocolo de capacidades" do `CLAUDE.md`.
