# 🗺️ Mapa de Capacidades — Claude Code no LiderTraining

> **O que é isto:** o inventário **completo e preciso** de tudo que o Claude tem ligado nesta
> conta — ferramentas nativas, subagentes, skills e MCPs/conectores — com o que **cada coisa
> faz de verdade**. Serve para o Claude entender o pedido, cruzar com este mapa e entregar
> sempre na **melhor versão**, combinando as capacidades certas.
>
> **Regra de ouro (Protocolo Pré-Tarefa):** antes de executar qualquer pedido, o Claude
> consulta este mapa, identifica a melhor skill/MCP/subagente, ativa-os (via `ToolSearch`) e
> só então executa.
>
> ⚠️ **Este arquivo é commitado de propósito.** O ambiente do Claude na nuvem é efêmero: o que
> não está salvo no repositório some entre sessões. O mapa anterior se perdeu por nunca ter
> sido commitado. Este mora aqui para nunca mais sumir.
>
> _Inventário verificado em 15/06/2026 — **13 conectores (MCPs), 14 skills, 6 subagentes**._

---

## 🚦 Protocolo Pré-Tarefa — antes de QUALQUER tarefa

1. **Entendo** o pedido do Caio: o que ele realmente quer como resultado?
2. **Classifico** a tarefa: banco? deploy? design? conteúdo? pesquisa? código? revisão? automação?
3. **Cruzo** com este mapa: qual a melhor skill / MCP / subagente — e qual ferramenta exata dentro dele?
4. **Ativo** o que falta com `ToolSearch` (MCPs e várias ferramentas chegam "adormecidos": só
   ficam chamáveis depois de carregados — carregue **antes** de chamar).
5. **Executo** na melhor versão, combinando capacidades; nunca fico no básico quando há ferramenta melhor.

### Atalho tarefa → capacidade

| Se a tarefa é... | Use... |
|---|---|
| Mexer em banco / schema / RLS / migration | MCP **Supabase** (sempre `list_tables` **antes** de criar nada) |
| Conferir deploy / erro de build / logs de runtime | MCP **Vercel** |
| PR, issue, CI/Actions, busca de código, vigiar PR | MCP **GitHub** |
| Criar/integrar tela, design system, diagrama | MCP **Figma** / **Canva** + `.claude/rules/design-system.md` |
| Gerar imagem, vídeo, áudio, 3D; prever viralidade | MCP **Higgsfield** |
| Documento, base de conhecimento, planilha, e-mail | MCP **Notion** / **Google Drive** / **Gmail** |
| Gravação/transcrição de reunião | MCP **Zoom** |
| CRM, contatos, campanhas | MCP **HubSpot** |
| Pesquisa profunda com fontes citadas | Skill **deep-research** |
| Revisar código antes de pushar | Skill **code-review** → **simplify** → **security-review** |
| Confirmar que o app funciona de verdade | Skill **verify** / **run** |
| Tarefa recorrente / monitorar PR | Skill **loop** / `subscribe_pr_activity` |
| Criar comportamento automático (hook/permissão) | Skill **update-config** |
| Dúvida sobre o próprio Claude Code / API Claude | Subagente **claude-code-guide** / skill **claude-api** |

---

## 🧰 1. Ferramentas nativas (sempre disponíveis, sem `ToolSearch`)

| Ferramenta | O que faz |
|---|---|
| **Read** | Lê arquivos (inclui imagens, PDFs e notebooks) |
| **Write / Edit** | Cria arquivos e faz substituições exatas em arquivos existentes |
| **Glob** | Busca arquivos por padrão de nome (`**/*.tsx`) |
| **Grep** | Busca por conteúdo (regex, ripgrep) — usar esta, não `grep` no Bash |
| **Bash** | Terminal: git, pnpm, scripts. Roda em background quando preciso |
| **ToolSearch** | **Carrega** ferramentas/MCPs adormecidos — o passo-chave do protocolo |
| **Agent** | Dispara subagentes em paralelo (ver seção 2) |
| **Skill** | Invoca uma skill (ver seção 3) |
| **WebSearch** | Busca na web |
| **WebFetch** | Lê o conteúdo de uma URL específica |
| **SendUserFile** | Entrega um arquivo pronto ao Caio (relatório, imagem, build) |
| **AskUserQuestion** | Pergunta com opções quando há ambiguidade real |
| **Monitor** | Acompanha um comando/processo em background até uma condição |
| **NotebookEdit** | Edita células de Jupyter notebooks |
| **ExitPlanMode** | Sai do modo de planejamento para execução |

## 🤖 2. Subagentes (via `Agent` — rodam em paralelo, devolvem só a conclusão)

| Subagente | O que faz / quando usar |
|---|---|
| **Explore** | Varredura ampla e **read-only** de muitos arquivos. Para "onde está X / como isto é usado" sem despejar arquivos. Não revisa código, localiza. |
| **Plan** | Desenha um plano de implementação passo a passo para uma tarefa maior. |
| **general-purpose** | Tarefas multi-step e buscas abertas com incerteza. |
| **claude** | Catch-all para tarefas que não encaixam num agente específico. |
| **claude-code-guide** | Dúvidas sobre o **próprio Claude Code**, SDK e API Claude (hooks, slash commands, MCP, settings). |
| **statusline-setup** | Configura a status line do Claude Code. |

## ⚡ 3. Skills instaladas (via `Skill`)

| Skill | O que faz |
|---|---|
| **deep-research** | Pesquisa profunda: leques de buscas, busca fontes, verifica de forma adversarial e entrega relatório **com citações**. |
| **code-review** | Revisa o diff atual caçando **bugs de correção** (níveis low → max). Pode comentar no PR ou aplicar correções. |
| **simplify** | Limpeza de **qualidade** no diff (reuso, simplificação, eficiência) e aplica os ajustes. Não caça bugs — para isso use code-review. |
| **security-review** | Revisão de **segurança** das mudanças pendentes da branch. |
| **verify** | Roda o app e **observa o comportamento** para confirmar que a mudança faz o que devia. |
| **run** | Sobe/dirige o app do projeto para ver a mudança funcionando (não só testes). |
| **review** | Revisa um **Pull Request**. |
| **init** | Cria/inicializa o `CLAUDE.md` com documentação do código. |
| **update-config** | Configura `settings.json`: **hooks, permissões, env vars** — é o caminho de qualquer "sempre que X, faça Y" automático. |
| **session-start-hook** | Cria **hooks de início de sessão** (Claude Code na web) para preparar deps/testes/linters. |
| **fewer-permission-prompts** | Gera uma allowlist em `.claude/settings.json` para **reduzir pedidos de permissão**. |
| **keybindings-help** | Customiza atalhos de teclado (`~/.claude/keybindings.json`). |
| **loop** | Roda um prompt/comando em **intervalo recorrente** (ex.: checar deploy a cada 5 min). |
| **claude-api** | Referência da **API Claude**: modelos, preços, params, streaming, tool use, MCP, caching, contagem de tokens. |

---

## 🔌 4. MCPs / Conectores — carregar via `ToolSearch` antes de usar

> Cada conector abaixo traz **várias ferramentas**. Listei as principais agrupadas por função,
> com o que fazem. "Conectado" = pronto para carregar via `ToolSearch` e chamar.

### 🟢 Núcleo do LiderTraining

#### **Supabase** — banco, auth, deploy de backend
- **Schema & dados:** `list_tables` (rode **sempre antes** de criar), `list_extensions`, `list_migrations`, `apply_migration`, `execute_sql`
- **Edge functions:** `list_edge_functions`, `get_edge_function`, `deploy_edge_function`
- **Observabilidade:** `get_logs`, `get_advisors` (alertas de **segurança e performance**)
- **Config do cliente:** `get_project_url`, `get_publishable_keys`, `generate_typescript_types`
- **Branches de dev:** `create_branch`, `list_branches`, `merge_branch`, `rebase_branch`, `reset_branch`, `delete_branch`
- **Projeto/org/custo:** `list_projects`, `get_project`, `create_project`, `pause/restore_project`, `get_cost`, `confirm_cost`
- **Docs:** `search_docs`
- ⚠️ *Migrations sempre aditivas (`IF NOT EXISTS`). Nunca colocar `service_role_key` no front.*

#### **Vercel** — deploys e produção
- **Deploys:** `list_deployments`, `get_deployment`, `get_deployment_build_logs` (diagnosticar build quebrado), `deploy_to_vercel`
- **Runtime:** `get_runtime_logs` (erros do app rodando)
- **Projetos/times:** `list_projects`, `get_project`, `list_teams`
- **Domínios:** `check_domain_availability_and_price`
- **URLs protegidas / fetch:** `get_access_to_vercel_url`, `web_fetch_vercel_url`
- **Toolbar (feedback no preview):** `list_toolbar_threads`, `get_toolbar_thread`, `reply_to_toolbar_thread`, `add_toolbar_reaction`, `edit_toolbar_message`, `change_toolbar_thread_resolve_status`
- **Docs:** `search_vercel_documentation`
- ⚠️ *Deploy é automático no push para `main`. Aqui eu só checo status/logs.*

#### **GitHub** — repositório, PRs, CI _(escopo restrito a `lidertraining/lidertraining`)_
- **PRs:** `list_pull_requests`, `pull_request_read`, `create_pull_request`, `update_pull_request`, `merge_pull_request`, `update_pull_request_branch`, `enable/disable_pr_auto_merge`
- **Review de PR:** `pull_request_review_write`, `add_comment_to_pending_review`, `add_reply_to_pull_request_comment`, `resolve/unresolve_review_thread`, `request_copilot_review`
- **Vigiar PR (eventos ao vivo):** `subscribe_pr_activity`, `unsubscribe_pr_activity`
- **Issues:** `list_issues`, `issue_read`, `issue_write`, `add_issue_comment`, `sub_issue_write`
- **Arquivos/branches:** `get_file_contents`, `create_or_update_file`, `push_files`, `delete_file`, `create_branch`, `list_branches`
- **Commits/tags/releases:** `get_commit`, `list_commits`, `get_tag`, `list_tags`, `get_latest_release`, `list_releases`
- **CI / Actions:** `actions_list`, `actions_get`, `actions_run_trigger`, `get_job_logs`
- **Busca:** `search_code`, `search_issues`, `search_pull_requests`, `search_repositories`, `search_commits`, `search_users`
- **Segurança:** `run_secret_scanning`
- ⚠️ *Não criar PR sem o Caio pedir. `gh` CLI não existe aqui — tudo via MCP.*

### 🎨 Conteúdo & design

#### **Figma** — design ↔ código
- **Ler design → código:** `get_design_context`, `get_screenshot`, `get_metadata`, `get_variable_defs`, `get_figjam`
- **Criar código → design:** `use_figma`, `create_new_file`, `generate_diagram`, `upload_assets`, `download_assets`
- **Design system:** `search_design_system`, `get_libraries`
- **Code Connect (mapear componentes):** `get_code_connect_map`, `add_code_connect_map`, `get_code_connect_suggestions`, `send_code_connect_mappings`
- ⚠️ *Antes de `use_figma`, rodar a skill `/figma-use` (exigência do servidor).*

#### **Canva** — designs prontos e brand templates
- **Criar/gerar:** `generate-design`, `generate-design-structured`, `create-design-from-brand-template`, `create-brand-template-draft`
- **Editar (em transação):** `start-editing-transaction` → `perform-editing-operations` → `commit-editing-transaction` (ou `cancel`)
- **Ler:** `get-design`, `get-design-content`, `get-design-pages`, `get-design-thumbnail`
- **Exportar:** `export-design`, `get-export-formats`
- **Organizar:** `create-folder`, `list-folder-items`, `move-item-to-folder`, `search-designs`, `search-brand-templates`
- **Assets/brand:** `get-assets`, `upload-asset-from-url`, `list-brand-kits`
- **Colaboração:** `comment-on-design`, `list-comments`, `reply-to-comment`

#### **Higgsfield** — geração de mídia
- **Gerar:** `generate_image`, `generate_video`, `generate_audio`, `generate_3d`
- **Editar mídia:** `remove_background`, `outpaint_image`, `upscale_image`, `upscale_video`, `reframe`, `motion_control`, `animation_actions`
- **Analisar:** `virality_predictor` (prever viralidade), `video_analysis_create/jobs/status`
- **Marketing/jogos:** `show_marketing_studio`, `personal_clipper_*`, `get_game_creation_instructions`, `deploy_game`, `publish_game`
- **Mídia I/O:** `media_upload_widget` (para arquivo local do Caio), `media_import_url` (para URL), `media_upload`/`media_confirm`
- **Conta:** `balance`, `show_plans_and_credits`, `list_workspaces`, `models_explore`, `presets_show`
- ⚠️ *Foto/vídeo local → `media_upload_widget` primeiro. URL da web → `media_import_url` (nunca passar URL crua).*

### 📚 Produtividade & dados

#### **Notion** — docs e bancos de dados
- **Buscar/ler:** `notion-search`, `notion-fetch`, `notion-get-comments`, `notion-get-users`, `notion-get-teams`
- **Páginas:** `notion-create-pages`, `notion-update-page`, `notion-duplicate-page`, `notion-move-pages`, `notion-create-comment`
- **Bancos de dados:** `notion-create-database`, `notion-update-data-source`, `notion-create-view`, `notion-update-view`

#### **Google Drive** — arquivos na nuvem
- `search_files`, `list_recent_files`, `get_file_metadata`, `get_file_permissions`, `read_file_content`, `download_file_content`, `create_file`, `copy_file`

#### **Gmail** — e-mail
- **Ler:** `search_threads`, `get_thread`
- **Rascunhos:** `create_draft`, `list_drafts`
- **Labels:** `list_labels`, `create_label`, `update_label`, `delete_label`, `label_message/thread`, `unlabel_message/thread`
- ⚠️ *Foca em ler, organizar com labels e **preparar rascunhos** — não há envio direto.*

#### **Zoom** — reuniões
- `search_zoom`, `search_meetings`, `recordings_list`, `get_recording_resource`, `get_meeting_assets`, `get_file_content`, `create_new_file_with_markdown` (notas em markdown)

#### **HubSpot** — CRM
- **Objetos CRM:** `get_crm_objects`, `manage_crm_objects`, `search_crm_objects`, `query_crm_data`
- **Propriedades:** `get_properties`, `search_properties`
- **Campanhas:** `get_campaign_analytics`, `get_campaign_asset_metrics`, `get_campaign_contacts_by_type`
- **Pessoas:** `search_owners`, `get_organization_details`, `get_user_details`
- ⚠️ *Começar por `tool_guidance` quando em dúvida sobre o fluxo.*

### 🧩 Outros (disponíveis, uso pontual)

#### **AWS Marketplace**
- `search_aws_marketplace_solutions`, `get_aws_marketplace_solution`, `research_aws_marketplace_solution`, `get_aws_marketplace_related_solutions`

#### **Uber**
- `get_estimates_between_two_locations_claude`, `publish_analytics_events`

---

## 🎯 5. Exemplo de protocolo na prática

> **Pedido:** "A tela de login está quebrando depois do último deploy."
>
> 1. **Entendo:** algo regrediu em produção no login.
> 2. **Classifico:** deploy + código + (talvez) auth.
> 3. **Cruzo/ativo:** `ToolSearch` → **Vercel** `get_deployment_build_logs` + `get_runtime_logs`;
>    **GitHub** `get_commit` do último merge; leio o código do login; se for auth, **Supabase** `get_logs`.
> 4. **Executo:** corrijo a causa.
> 5. **Garanto a melhor versão:** skill **code-review** + **verify** antes de pushar.

---

## 🔁 6. Como manter este mapa vivo

- Sempre que um MCP/skill **novo** aparecer (ou sumir), atualizar este arquivo na mesma sessão.
- **O que garante o protocolo sem depender de memória:** a regra está fixada no `CLAUDE.md`
  (seção "Protocolo de capacidades"), que é carregado automaticamente em **toda** sessão.
- **Reforço opcional (só com autorização do Caio):** um hook de início de sessão pode exibir um
  resumo deste mapa automaticamente. Como é script auto-executável, só entra com "ok" explícito.
- **Para replicar em outro repositório:** copie `.claude/MAPA-CAPACIDADES.md` e o bloco da seção
  "Protocolo de capacidades" do `CLAUDE.md`; depois ajuste o inventário ao que estiver ligado lá.
