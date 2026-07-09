#!/bin/bash
# ============================================================
# Instalador — MCP Instagram Transcriber (Mac)
#
# Como rodar (Terminal, na pasta deste arquivo):
#   bash setup-mac.sh
#
# Faz tudo: Python, ffmpeg, yt-dlp, venv, dependencias,
# config do Claude Desktop (preservando outros MCP servers) e verificacao.
# ============================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

VENV_DIR="$HOME/mcp-transcriber-env"
SERVERS_DIR="$HOME/mcp-servers"
VENV_PYTHON="$VENV_DIR/bin/python"
SERVER_PY="$SERVERS_DIR/server.py"
CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

find_python() {
    for cmd in python3.12 python3.11 python3.10 python3; do
        if command -v "$cmd" >/dev/null 2>&1; then
            if "$cmd" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' 2>/dev/null; then
                command -v "$cmd"
                return 0
            fi
        fi
    done
    return 1
}

echo ""
echo "== 1/7 Verificando Homebrew =="
if ! command -v brew >/dev/null 2>&1; then
    echo "Homebrew nao encontrado. Instalando..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv)"
fi
echo "Homebrew OK"

echo ""
echo "== 2/7 Verificando Python 3.10+ =="
if ! PYTHON="$(find_python)"; then
    echo "Python 3.10+ nao encontrado. Instalando python@3.12 via brew..."
    brew install python@3.12
    PYTHON="$(find_python)"
fi
echo "Python OK: $PYTHON"

echo ""
echo "== 3/7 Verificando ffmpeg e yt-dlp (global) =="
command -v ffmpeg >/dev/null 2>&1 || brew install ffmpeg
command -v yt-dlp >/dev/null 2>&1 || brew install yt-dlp
echo "ffmpeg OK: $(command -v ffmpeg)"
echo "yt-dlp OK: $(command -v yt-dlp)"

echo ""
echo "== 4/7 Criando virtual environment em $VENV_DIR =="
[ -x "$VENV_PYTHON" ] || "$PYTHON" -m venv "$VENV_DIR"
echo "venv OK: $VENV_PYTHON"

echo ""
echo "== 5/7 Instalando dependencias (yt-dlp, openai-whisper, mcp) =="
echo "Isso pode demorar alguns minutos (o whisper baixa o PyTorch)..."
"$VENV_PYTHON" -m pip install --upgrade pip
"$VENV_PYTHON" -m pip install --upgrade yt-dlp openai-whisper mcp
echo "Dependencias OK"

echo ""
echo "== 6/7 Instalando server.py em $SERVERS_DIR =="
mkdir -p "$SERVERS_DIR"
cp "$SCRIPT_DIR/server.py" "$SERVER_PY"
echo "server.py OK: $SERVER_PY"

echo ""
echo "== 7/7 Configurando Claude Desktop (preserva servers existentes) =="
"$VENV_PYTHON" "$SCRIPT_DIR/merge_config.py" "$CONFIG_PATH" "$VENV_PYTHON" "$SERVER_PY"

echo ""
echo "== Verificacao final =="
"$VENV_PYTHON" -c "import whisper; import mcp; print('OK: whisper + mcp importados')"
which yt-dlp
which ffmpeg

echo ""
echo "============================================================"
echo " TUDO PRONTO!"
echo "============================================================"
echo " 1. Feche o Claude Desktop (Cmd+Q)"
echo " 2. Abra novamente"
echo " 3. Teste com:"
echo "    Analisa o perfil @isabelamatte — transcreve os 3 ultimos"
echo "    Reels e me diz quais padroes de roteiro ela usa, qual o"
echo "    ritmo de fala e como sao os hooks."
echo ""
echo " Obs: na 1a transcricao o Whisper baixa o modelo (~1,5 GB)."
echo " Para os Reels, mantenha-se logado no Instagram pelo Chrome."
echo "============================================================"
