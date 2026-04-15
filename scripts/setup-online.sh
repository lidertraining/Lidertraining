#!/usr/bin/env bash
# Cria um projeto Supabase hospedado, aplica as 4 migrations, gera tipos
# e popula .env.local. Roda na sua m\u00e1quina (n\u00e3o no sandbox).
#
# Uso:
#   pnpm setup:online
#
# Ou com token via env:
#   SUPABASE_ACCESS_TOKEN=sbp_xxx bash scripts/setup-online.sh
#
# Depend\u00eancias:
#   - curl
#   - node (j\u00e1 instalado se voc\u00ea usa pnpm/npm; usado para parsear JSON)

set -euo pipefail

BLUE="\033[1;34m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
NC="\033[0m"

API="https://api.supabase.com/v1"

# ---------- helpers ----------
json_get() {
  # json_get '.path.to.value' <<< "$json"
  node -e "
    let data='';
    process.stdin.on('data', d => data += d);
    process.stdin.on('end', () => {
      try {
        const j = JSON.parse(data);
        const path = '$1'.replace(/^\./, '').split('.').filter(Boolean);
        let cur = j;
        for (const p of path) cur = cur?.[p];
        if (Array.isArray(cur) || typeof cur === 'object') {
          console.log(JSON.stringify(cur));
        } else if (cur !== undefined) {
          console.log(cur);
        }
      } catch (e) {}
    });
  "
}

json_escape() {
  node -e "
    let data='';
    process.stdin.on('data', d => data += d);
    process.stdin.on('end', () => process.stdout.write(JSON.stringify(data)));
  "
}

die() {
  echo -e "${RED}$1${NC}" >&2
  exit 1
}

# ---------- 1) token ----------
if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo -e "${YELLOW}Gere um Personal Access Token em:${NC}"
  echo "  https://supabase.com/dashboard/account/tokens"
  echo ""
  read -rsp "Cole aqui (formato sbp_...): " SUPABASE_ACCESS_TOKEN
  echo ""
fi

[[ "$SUPABASE_ACCESS_TOKEN" =~ ^sbp_ ]] || die "Token inv\u00e1lido (deve come\u00e7ar com sbp_)."

AUTH_HEADER="Authorization: Bearer $SUPABASE_ACCESS_TOKEN"

# ---------- 2) deps ----------
command -v curl &> /dev/null || die "curl n\u00e3o encontrado."
command -v node &> /dev/null || die "node n\u00e3o encontrado (necess\u00e1rio para parse JSON)."

# ---------- 3) listar orgs ----------
echo -e "${BLUE}Listando organizações\u2026${NC}"
ORGS=$(curl -sf -H "$AUTH_HEADER" "$API/organizations") || die "Falha ao listar orgs. Token v\u00e1lido?"

node -e "
  const orgs = $ORGS;
  if (!orgs.length) { console.error('Nenhuma org encontrada.'); process.exit(1); }
  orgs.forEach((o, i) => console.log(\`[\${i+1}] \${o.id.padEnd(24)} \${o.name}\`));
"

read -rp "N\u00famero da org (ou cole o ID): " ORG_CHOICE

# Se for n\u00famero, converter para ID
if [[ "$ORG_CHOICE" =~ ^[0-9]+$ ]]; then
  ORG_ID=$(node -e "
    const orgs = $ORGS;
    const idx = parseInt('$ORG_CHOICE') - 1;
    if (!orgs[idx]) process.exit(1);
    console.log(orgs[idx].id);
  ") || die "\u00cdndice inv\u00e1lido."
else
  ORG_ID="$ORG_CHOICE"
fi

echo -e "${GREEN}\u2713 Org:${NC} $ORG_ID"

# ---------- 4) criar projeto ----------
read -rp "Nome do projeto [lidertraining]: " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-lidertraining}

read -rp "Regi\u00e3o [sa-east-1]: " REGION
REGION=${REGION:-sa-east-1}

# Senha do DB aleat\u00f3ria por padr\u00e3o (mais seguro que pedir ao user)
DB_PASS=$(node -e "console.log(require('crypto').randomBytes(18).toString('base64').replace(/[+\/=@'\"]/g, 'x'))")
echo -e "${YELLOW}Senha do Postgres gerada automaticamente.${NC}"
echo -e "${YELLOW}Guarde: ${GREEN}$DB_PASS${NC}"
echo ""

echo -e "${BLUE}Criando projeto\u2026${NC}"
CREATE_BODY=$(cat <<EOF
{
  "name": "$PROJECT_NAME",
  "organization_id": "$ORG_ID",
  "region": "$REGION",
  "db_pass": "$DB_PASS",
  "plan": "free"
}
EOF
)

CREATE_RES=$(curl -s -w "\n%{http_code}" -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d "$CREATE_BODY" "$API/projects")

HTTP_CODE=$(echo "$CREATE_RES" | tail -n1)
BODY=$(echo "$CREATE_RES" | sed '$d')

if [[ "$HTTP_CODE" != "201" && "$HTTP_CODE" != "200" ]]; then
  echo -e "${RED}Falha (HTTP $HTTP_CODE):${NC}"
  echo "$BODY"
  exit 1
fi

PROJECT_REF=$(echo "$BODY" | json_get ".id")
[[ -n "$PROJECT_REF" ]] || die "Resposta sem 'id'."

echo -e "${GREEN}\u2713 Projeto criado: $PROJECT_REF${NC}"

# ---------- 5) aguardar ACTIVE_HEALTHY ----------
echo -e "${BLUE}Aguardando provisionamento (2-4 min)\u2026${NC}"
for i in {1..36}; do
  STATUS_RES=$(curl -sf -H "$AUTH_HEADER" "$API/projects/$PROJECT_REF" || echo '{}')
  STATUS=$(echo "$STATUS_RES" | json_get ".status")
  printf "  [%2d/36] %s\n" "$i" "${STATUS:-?}"
  if [[ "$STATUS" == "ACTIVE_HEALTHY" ]]; then
    break
  fi
  sleep 10
done

[[ "$STATUS" == "ACTIVE_HEALTHY" ]] || die "Projeto n\u00e3o ficou saud\u00e1vel em 6min. Cheque o dashboard."

# ---------- 6) pegar anon key ----------
KEYS=$(curl -sf -H "$AUTH_HEADER" "$API/projects/$PROJECT_REF/api-keys") || die "Falha ao buscar api-keys."

ANON_KEY=$(node -e "
  const keys = $KEYS;
  const k = keys.find(x => x.name === 'anon');
  if (!k) process.exit(1);
  console.log(k.api_key);
") || die "Anon key n\u00e3o encontrada."

PROJECT_URL="https://${PROJECT_REF}.supabase.co"

# ---------- 7) aplicar migrations ----------
echo -e "${BLUE}Aplicando migrations\u2026${NC}"
for MIG in supabase/migrations/*.sql; do
  [[ -f "$MIG" ]] || continue
  NAME=$(basename "$MIG")
  echo "  \u2192 $NAME"

  SQL_JSON=$(json_escape < "$MIG")
  RES=$(curl -s -w "\n%{http_code}" -H "$AUTH_HEADER" -H "Content-Type: application/json" \
    -d "{\"query\": $SQL_JSON}" \
    "$API/projects/$PROJECT_REF/database/query")

  CODE=$(echo "$RES" | tail -n1)
  RES_BODY=$(echo "$RES" | sed '$d')

  if [[ "$CODE" != "200" && "$CODE" != "201" ]]; then
    echo -e "${RED}  Erro (HTTP $CODE):${NC}"
    echo "$RES_BODY"
    exit 1
  fi
done
echo -e "${GREEN}\u2713 Migrations aplicadas${NC}"

# ---------- 8) seed opcional ----------
read -rp "Aplicar supabase/seed.sql (cria user root + invite DEMO2026)? [y/N] " RUN_SEED
if [[ "$RUN_SEED" =~ ^[yY] ]]; then
  echo -e "${BLUE}Aplicando seed\u2026${NC}"
  SQL_JSON=$(json_escape < supabase/seed.sql)
  curl -sf -H "$AUTH_HEADER" -H "Content-Type: application/json" \
    -d "{\"query\": $SQL_JSON}" \
    "$API/projects/$PROJECT_REF/database/query" > /dev/null \
    && echo -e "${GREEN}\u2713 Seed aplicado${NC}" \
    || echo -e "${YELLOW}Seed falhou (pode j\u00e1 existir). Continuando.${NC}"
fi

# ---------- 9) popular .env.local ----------
if [[ -f .env.local ]]; then
  cp .env.local .env.local.bak
  echo -e "${YELLOW}.env.local existente copiado para .env.local.bak${NC}"
fi

cat > .env.local <<EOF
# Gerado automaticamente por scripts/setup-online.sh em $(date)
VITE_SUPABASE_URL=$PROJECT_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=LiderTraining
EOF

echo -e "${GREEN}\u2713 .env.local populado${NC}"

# ---------- 10) gerar tipos (se CLI dispon\u00edvel) ----------
if command -v supabase &> /dev/null; then
  echo -e "${BLUE}Gerando src/types/database.ts\u2026${NC}"
  SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" \
    supabase gen types typescript --project-id "$PROJECT_REF" \
    > src/types/database.ts 2>/dev/null \
    && echo -e "${GREEN}\u2713 Tipos gerados${NC}" \
    || echo -e "${YELLOW}Geracao de tipos falhou. Rode manualmente:${NC} npx supabase gen types typescript --project-id $PROJECT_REF > src/types/database.ts"
else
  echo -e "${YELLOW}Supabase CLI n\u00e3o encontrada. Para gerar tipos depois:${NC}"
  echo "  npx supabase gen types typescript --project-id $PROJECT_REF > src/types/database.ts"
fi

# ---------- fim ----------
cat <<EOF

${GREEN}============================================${NC}
${GREEN}\u2713 Setup online completo!${NC}
${GREEN}============================================${NC}

Project ref:     $PROJECT_REF
Dashboard:       https://supabase.com/dashboard/project/$PROJECT_REF
URL:             $PROJECT_URL
Senha do DB:     $DB_PASS  (anote se for usar via psql)

${YELLOW}Pr\u00f3ximos passos:${NC}
  1. pnpm dev
  2. http://localhost:5173/signup/DEMO2026 (se aplicou seed)
  3. (seguran\u00e7a) Revogue o token que voc\u00ea usou:
     https://supabase.com/dashboard/account/tokens

EOF
