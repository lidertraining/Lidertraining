#!/usr/bin/env bash
# Setup automatizado do Supabase local para o LiderTraining.
# Uso: pnpm setup

set -e

BLUE="\033[1;34m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
NC="\033[0m"

echo -e "${BLUE}LiderTraining — setup do Supabase local${NC}"
echo ""

# 1) Supabase CLI
if ! command -v supabase &> /dev/null; then
  echo -e "${YELLOW}Supabase CLI não encontrada.${NC}"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Instalando via brew..."
    brew install supabase/tap/supabase
  elif command -v scoop &> /dev/null; then
    echo "Instalando via scoop..."
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    scoop install supabase
  else
    echo -e "${RED}Instale manualmente: https://supabase.com/docs/guides/cli/getting-started${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✓${NC} Supabase CLI detectada: $(supabase --version)"
echo ""

# 2) Docker
if ! docker info &> /dev/null; then
  echo -e "${RED}Docker não está rodando.${NC} Inicie o Docker Desktop e tente de novo."
  exit 1
fi
echo -e "${GREEN}✓${NC} Docker rodando"
echo ""

# 3) Start stack local
echo -e "${BLUE}Subindo Postgres + Auth + Studio local…${NC}"
supabase start

# 4) Reset + apply migrations + seed
echo ""
echo -e "${BLUE}Aplicando migrations e seed…${NC}"
supabase db reset

# 5) Generate TypeScript types
echo ""
echo -e "${BLUE}Gerando tipos TypeScript…${NC}"
supabase gen types typescript --local > src/types/database.ts

# 6) Print credentials para o .env.local
echo ""
echo -e "${GREEN}✓ Setup completo!${NC}"
echo ""
echo -e "${YELLOW}Copie as credenciais abaixo para seu .env.local:${NC}"
echo ""
supabase status | grep -E "API URL|anon key"
echo ""
echo -e "Depois rode: ${BLUE}pnpm dev${NC}"
