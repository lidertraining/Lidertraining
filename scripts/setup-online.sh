#!/usr/bin/env bash
# Cria um projeto Supabase hospedado, aplica as 4 migrations, gera tipos
# e popula .env.local. Roda no seu laptop \u2014 n\u00e3o no sandbox do Claude.
#
# Uso:
#   export SUPABASE_ACCESS_TOKEN=sbp_xxx
#   bash scripts/setup-online.sh
#
# Ou interativo:
#   bash scripts/setup-online.sh

set -e

BLUE="\033[1;34m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
NC="\033[0m"

API="https://api.supabase.com/v1"

# -----------------------------------------------------------
# 1) Token
# -----------------------------------------------------------
if [[ -z "$SUPABASE_ACCESS_TOKEN" ]]; then
  echo -e "${YELLOW}Gere um Personal Access Token em:${NC}"
  echo "  https://supabase.com/dashboard/account/tokens"
  echo ""
  read -rsp "Cole aqui (formato sbp_...): " SUPABASE_ACCESS_TOKEN
  echo ""
fi

if [[ ! "$SUPABASE_ACCESS_TOKEN" =~ ^sbp_ ]]; then
  echo -e "${RED}Token inv\u00e1lido (deve come\u00e7ar com sbp_).${NC}"
  exit 1
fi

AUTH="Authorization: Bearer $SUPABASE_ACCESS_TOKEN"

# -----------------------------------------------------------
# 2) Dependencies
# -----------------------------------------------------------
for cmd in curl jq; do
  if ! command -v "$cmd" &> /dev/null; then
    echo -e "${RED}Precisa de '$cmd' instalado.${NC}"
    exit 1
  fi
done

# -----------------------------------------------------------
# 3) Escolher organiza\u00e7\u00e3o
# -----------------------------------------------------------
echo -e "${BLUE}Listando organizações\u2026${NC}"
ORGS=$(curl -sf -H "$AUTH" "$API/organizations")
if [[ -z "$ORGS" ]]; then
  echo -e "${RED}Falha ao listar orgs. Token v\u00e1lido?${NC}"
  exit 1
fi

echo "$ORGS" | jq -r '.[] | "\(.id)  \(.name)"'
echo ""
read -rp "Cole o ID da organiza\u00e7\u00e3o: " ORG_ID

# -----------------------------------------------------------
# 4) Criar projeto
# -----------------------------------------------------------
read -rp "Nome do projeto [lidertraining]: " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-lidertraining}

read -rp "Regi\u00e3o [sa-east-1]: " REGION
REGION=${REGION:-sa-east-1}

read -rsp "Senha do Postgres (m\u00edn. 8 chars, sem @, /, \", '): " DB_PASS
echo ""

echo -e "${BLUE}Criando projeto\u2026 (pode levar 2-4 min)${NC}"
CREATE_RES=$(curl -sf -H "$AUTH" -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$PROJECT_NAME\",
    \"organization_id\": \"$ORG_ID\",
    \"region\": \"$REGION\",
    \"db_pass\": \"$DB_PASS\",
    \"plan\": \"free\"
  }" \
  "$API/projects")

PROJECT_REF=$(echo "$CREATE_RES" | jq -r '.id')
if [[ -z "$PROJECT_REF" || "$PROJECT_REF" == "null" ]]; then
  echo -e "${RED}Falha ao criar projeto:${NC}"
  echo "$CREATE_RES"
  exit 1
fi

echo -e "${GREEN}\u2713 Projeto criado: $PROJECT_REF${NC}"

# -----------------------------------------------------------
# 5) Aguardar ficar ACTIVE_HEALTHY
# -----------------------------------------------------------
echo -e "${BLUE}Aguardando provisionamento\u2026${NC}"
for i in {1..30}; do
  STATUS=$(curl -sf -H "$AUTH" "$API/projects/$PROJECT_REF" | jq -r '.status')
  echo "  [$i/30] $STATUS"
  if [[ "$STATUS" == "ACTIVE_HEALTHY" ]]; then break; fi
  sleep 10
done

if [[ "$STATUS" != "ACTIVE_HEALTHY" ]]; then
  echo -e "${RED}Projeto n\u00e3o ficou saud\u00e1vel em 5min. Tente de novo em breve.${NC}"
  exit 1
fi

# -----------------------------------------------------------
# 6) Buscar anon key e URL
# -----------------------------------------------------------
KEYS=$(curl -sf -H "$AUTH" "$API/projects/$PROJECT_REF/api-keys")
ANON_KEY=$(echo "$KEYS" | jq -r '.[] | select(.name=="anon") | .api_key')
PROJECT_URL="https://${PROJECT_REF}.supabase.co"

# -----------------------------------------------------------
# 7) Aplicar migrations via /database/query
# -----------------------------------------------------------
echo -e "${BLUE}Aplicando migrations\u2026${NC}"
for MIG in supabase/migrations/*.sql; do
  echo "  \u2192 $(basename "$MIG")"
  SQL=$(jq -Rs . < "$MIG")
  RES=$(curl -s -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"query\": $SQL}" \
    "$API/projects/$PROJECT_REF/database/query")
  if echo "$RES" | jq -e '.message' &>/dev/null; then
    echo -e "${RED}  Erro:${NC}"
    echo "$RES" | jq
    exit 1
  fi
done
echo -e "${GREEN}\u2713 Migrations aplicadas${NC}"

# Seed opcional (mesmo arquivo roda em prod com cautela; pula se preferir)
read -rp "Aplicar supabase/seed.sql (cria user root + invite DEMO2026)? [y/N] " RUN_SEED
if [[ "$RUN_SEED" =~ ^[yY] ]]; then
  SQL=$(jq -Rs . < supabase/seed.sql)
  curl -s -H "$AUTH" -H "Content-Type: application/json" \
    -d "{\"query\": $SQL}" \
    "$API/projects/$PROJECT_REF/database/query" > /dev/null
  echo -e "${GREEN}\u2713 Seed aplicado${NC}"
fi

# -----------------------------------------------------------
# 8) Popular .env.local
# -----------------------------------------------------------
cat > .env.local <<EOF
VITE_SUPABASE_URL=$PROJECT_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=LiderTraining
EOF

echo -e "${GREEN}\u2713 .env.local populado${NC}"

# -----------------------------------------------------------
# 9) Gerar tipos TS (requer Supabase CLI logada; opcional)
# -----------------------------------------------------------
if command -v supabase &> /dev/null; then
  echo -e "${BLUE}Gerando src/types/database.ts\u2026${NC}"
  SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" \
    supabase gen types typescript --project-id "$PROJECT_REF" > src/types/database.ts
  echo -e "${GREEN}\u2713 Tipos gerados. Agora ative createClient<Database> em src/lib/supabase.ts${NC}"
else
  echo -e "${YELLOW}Supabase CLI n\u00e3o encontrada. Para gerar tipos:${NC}"
  echo "  npx supabase gen types typescript --project-id $PROJECT_REF > src/types/database.ts"
fi

# -----------------------------------------------------------
# Fim
# -----------------------------------------------------------
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}\u2713 Setup online completo!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Project ref:     $PROJECT_REF"
echo "Dashboard:       https://supabase.com/dashboard/project/$PROJECT_REF"
echo "URL:             $PROJECT_URL"
echo ""
echo -e "${YELLOW}Pr\u00f3ximos passos:${NC}"
echo "  1. Rode: pnpm dev"
echo "  2. Acesse: http://localhost:5173/signup/DEMO2026"
echo "  3. (seguran\u00e7a) Revogue o token:"
echo "     https://supabase.com/dashboard/account/tokens"
