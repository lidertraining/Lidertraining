# Workflows operacionais — LiderTraining

Regras concretas para executar tarefas recorrentes neste projeto.

---

## Workflow: primeira configuração do `.env` numa máquina

Se o projeto tem apenas `.env.example` e falta o `.env` real:

1. Use o MCP do Supabase para listar projetos do usuário (`list_projects`)
2. Identifique o projeto LiderTraining (nome contém "lider", "lidertraining" ou "lt")
3. Use `get_project_url` e `get_publishable_keys` para pegar URL e anon key
4. Copie `.env.example` para `.env` e preencha:
   - `VITE_SUPABASE_URL` → URL do projeto
   - `VITE_SUPABASE_ANON_KEY` → anon/publishable key
5. **NUNCA** coloque `service_role_key` no `.env` do frontend (é secret)
6. Confirme que `.env` está em `.gitignore`

## Workflow: rodar uma migration Supabase

1. **Primeiro investigue** via MCP Supabase: `list_tables` do schema `public`
2. Compare com o que a migration quer criar. Aponte conflitos potenciais para o usuário.
3. Torne a migration defensiva:
   - `CREATE TABLE IF NOT EXISTS`
   - `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
   - `DROP POLICY IF EXISTS` antes de recriar policies
   - Blocos `DO $$ ... $$` com `pg_constraint` check para constraints únicas
4. Aplique via MCP (`apply_migration` ou `execute_sql`) ou instrua o usuário a colar no SQL Editor do Dashboard
5. Após aplicar, use `list_tables` novamente para confirmar que as tabelas esperadas estão lá
6. Se houver qualquer erro, **pare** e reporte em linguagem clara. Não tente soluções exploratórias.

## Workflow: deploy via Vercel

O projeto tem auto-deploy: qualquer push para `main` no GitHub dispara build na Vercel.

1. Trabalhe em branch (`feat/*`, `fix/*`)
2. Commits claros em português, por etapa
3. Quando estiver pronto, peça autorização ao usuário antes de fazer merge para `main`
4. Após o push para `main`, use MCP Vercel para:
   - `list_deployments` do projeto
   - Se houver erro de build, `get_deployment_build_logs` para diagnóstico
5. Reporte status ao usuário em 3 linhas: status do deploy, URL, erros se houver

## Workflow: diagnóstico de erro sem Node.js local

Usuário não tem Node instalado. Para validar mudanças:

1. Leia código estaticamente para pegar erros óbvios (imports quebrados, JSX mal formado)
2. Commit e push para branch
3. Peça ao usuário para fazer merge em `main` (ou abra PR e o usuário autoriza)
4. Use MCP Vercel para verificar build
5. Se build falha, pegue os logs e proponha correção

## Workflow: integrar componente novo em fluxo existente

Antes de substituir qualquer tela ou componente:

1. `grep` por referências ao componente antigo
2. Renomeie o antigo para `.old.{ext}` (mantendo a extensão original)
3. Importe o novo nos mesmos pontos onde o antigo era usado
4. Commit separado: `chore: backup <componente> pre-refactor`
5. Commit da integração: `feat(<escopo>): substitui <componente> pela versão nova`

## Workflow: trabalhar em Windows PowerShell

- Para apagar: `Remove-Item arquivo.txt` (não `rm`)
- Para criar diretório: `New-Item -ItemType Directory -Path "pasta"` (ou `mkdir`)
- Para extrair zip: `Expand-Archive -Path arquivo.zip -DestinationPath . -Force`
- Paths com backslash funcionam, mas forward slash também (Git/Node aceitam)
- Se um comando bash falhar, traduza para o equivalente PowerShell antes de pedir ajuda

## Workflow: quando criar uma branch nova

- Feature nova grande (mais de 3 arquivos): sim, branch
- Correção pequena (1 arquivo, linha única): pode ir direto no `main` se o usuário autorizar
- Mudanças experimentais: sempre branch, nunca em `main`
- Nome: `feat/<descricao-curta>` em kebab-case

## Workflow: resposta a "continuar de onde paramos"

Se o usuário diz algo como "continue", "segue o projeto", "retome":

1. `git log --oneline -10` para ver últimos commits
2. `git status` para ver arquivos pendentes
3. MCP Vercel: último deployment
4. MCP Supabase: tabelas recentes
5. Resuma em 5 linhas o estado atual e proponha 2-3 próximos passos para o usuário escolher

## Anti-padrões: o que NÃO fazer

- Instalar Node.js ou npm (usuário não quer)
- Rodar `npm run dev` (sem Node)
- Criar arquivo `.env` no repositório (é secret)
- Sobrescrever migrations existentes
- Commit com mensagens genéricas ("update", "fix")
- Push direto em `main` sem aviso
- Iniciar refactor amplo sem autorização
- Responder em inglês
