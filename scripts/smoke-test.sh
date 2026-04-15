#!/usr/bin/env bash
# Valida que o Supabase est\u00e1 configurado corretamente.
# L\u00ea .env.local, faz 3 requests REST e mostra resultado.
# Uso: pnpm smoke

set -e

BLUE="\033[1;34m"
GREEN="\033[1;32m"
RED="\033[1;31m"
NC="\033[0m"

if [[ ! -f .env.local ]]; then
  echo -e "${RED}.env.local n\u00e3o encontrado. Rode 'pnpm setup:online' ou copie manualmente.${NC}"
  exit 1
fi

# Extract vars
URL=$(grep VITE_SUPABASE_URL .env.local | cut -d= -f2)
KEY=$(grep VITE_SUPABASE_ANON_KEY .env.local | cut -d= -f2)

[[ -n "$URL" && "$URL" != *placeholder* ]] || { echo -e "${RED}VITE_SUPABASE_URL ausente/placeholder${NC}"; exit 1; }
[[ -n "$KEY" && "$KEY" != *placeholder* ]] || { echo -e "${RED}VITE_SUPABASE_ANON_KEY ausente/placeholder${NC}"; exit 1; }

echo -e "${BLUE}URL:${NC} $URL"
echo ""

# --- 1 ---
echo -e "${BLUE}[1/4] Ping REST root\u2026${NC}"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "apikey: $KEY" "$URL/rest/v1/")
if [[ "$CODE" == "200" || "$CODE" == "404" ]]; then
  echo -e "  ${GREEN}\u2713 REST acess\u00edvel (HTTP $CODE)${NC}"
else
  echo -e "  ${RED}\u2717 HTTP $CODE${NC}"
  exit 1
fi

# --- 2 ---
echo -e "${BLUE}[2/4] Checando journey_steps (espera 11 linhas)\u2026${NC}"
STEPS=$(curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "$URL/rest/v1/journey_steps?select=id&order=id")
N=$(echo "$STEPS" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
    try{ console.log(JSON.parse(d).length) }catch(e){ console.log(0) }
  })
")
if [[ "$N" == "11" ]]; then
  echo -e "  ${GREEN}\u2713 11 passos seedados${NC}"
else
  echo -e "  ${RED}\u2717 Esperava 11, recebeu $N${NC}"
  echo "  Resposta: $STEPS"
  exit 1
fi

# --- 3 ---
echo -e "${BLUE}[3/4] Checando audios (espera 8)\u2026${NC}"
N=$(curl -s -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  "$URL/rest/v1/audios?select=id&order=order_idx" | node -e "
  let d=''; process.stdin.on('data',c=>d+=c); process.stdin.on('end',()=>{
    try{ console.log(JSON.parse(d).length) }catch(e){ console.log(0) }
  })
")
if [[ "$N" == "8" ]]; then
  echo -e "  ${GREEN}\u2713 8 \u00e1udios seedados${NC}"
else
  echo -e "  ${RED}\u2717 Esperava 8, recebeu $N${NC}"
  exit 1
fi

# --- 4 ---
echo -e "${BLUE}[4/4] Checando RPC is_ancestor_of existe\u2026${NC}"
CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"ancestor":"00000000-0000-0000-0000-000000000000","descendant":"00000000-0000-0000-0000-000000000000"}' \
  "$URL/rest/v1/rpc/is_ancestor_of")
if [[ "$CODE" == "200" || "$CODE" == "204" ]]; then
  echo -e "  ${GREEN}\u2713 Fun\u00e7\u00e3o registrada${NC}"
else
  echo -e "  ${RED}\u2717 HTTP $CODE \u2014 migration de functions n\u00e3o aplicada?${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}\u2713 Supabase conectado e schema OK${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Pr\u00f3ximo: pnpm dev \u2192 http://localhost:5173/signup/DEMO2026"
