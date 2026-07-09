# ============================================================
# Instalador — MCP Instagram Transcriber (Windows)
#
# Como rodar (PowerShell, na pasta deste arquivo):
#   powershell -ExecutionPolicy Bypass -File .\setup-windows.ps1
#
# Instala TUDO numa pasta unica e independente:
#   C:\mcp-instagram-transcriber\
#     ├── server.py       (o MCP Server)
#     ├── venv\           (Python + dependencias, isolado)
#     ├── transcricoes\   (saidas das transcricoes)
#     └── LEIA-ME.md
#
# Depois de instalado, essa pasta nao depende de mais nada —
# pode apagar/mover o repositorio que ela continua funcionando.
# ============================================================

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$ProjectDir = "C:\mcp-instagram-transcriber"
$VenvDir    = Join-Path $ProjectDir "venv"
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
$ServerPy   = Join-Path $ProjectDir "server.py"
$ConfigPath = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"

function Refresh-Path {
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [Environment]::GetEnvironmentVariable("Path", "User")
}

function Find-Python {
    foreach ($cmd in @("python", "python3", "py")) {
        $exe = Get-Command $cmd -ErrorAction SilentlyContinue
        if (-not $exe) { continue }
        try {
            $v = & $exe.Source -c "import sys; print('%d.%d' % sys.version_info[:2])" 2>$null
            if ($v -match "^(\d+)\.(\d+)$" -and [int]$Matches[1] -eq 3 -and [int]$Matches[2] -ge 10) {
                return $exe.Source
            }
        } catch { }
    }
    return $null
}

Write-Host "`n== 1/7 Verificando Python 3.10+ ==" -ForegroundColor Cyan
$Python = Find-Python
if (-not $Python) {
    Write-Host "Python 3.10+ nao encontrado. Instalando Python 3.12 via winget..."
    winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
    Refresh-Path
    $Python = Find-Python
    if (-not $Python) { throw "Python instalado mas nao encontrado no PATH. Feche e reabra o PowerShell e rode o script de novo." }
}
Write-Host "Python OK: $Python" -ForegroundColor Green

Write-Host "`n== 2/7 Verificando ffmpeg ==" -ForegroundColor Cyan
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "ffmpeg nao encontrado. Instalando via winget..."
    winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements
    Refresh-Path
}
if (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
    Write-Host "ffmpeg OK: $((Get-Command ffmpeg).Source)" -ForegroundColor Green
} else {
    Write-Host "AVISO: ffmpeg instalado mas ainda fora do PATH desta janela. Sera detectado apos reabrir o terminal / reiniciar." -ForegroundColor Yellow
}

Write-Host "`n== 3/7 Verificando yt-dlp (global) ==" -ForegroundColor Cyan
if (-not (Get-Command yt-dlp -ErrorAction SilentlyContinue)) {
    Write-Host "yt-dlp nao encontrado. Instalando via winget..."
    winget install -e --id yt-dlp.yt-dlp --accept-source-agreements --accept-package-agreements
    Refresh-Path
}
if (Get-Command yt-dlp -ErrorAction SilentlyContinue) {
    Write-Host "yt-dlp OK: $((Get-Command yt-dlp).Source)" -ForegroundColor Green
} else {
    Write-Host "AVISO: yt-dlp global fora do PATH desta janela — sem problema, a copia do venv cobre." -ForegroundColor Yellow
}

Write-Host "`n== 4/7 Criando pasta do projeto: $ProjectDir ==" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $ProjectDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $ProjectDir "transcricoes") | Out-Null
Copy-Item (Join-Path $ScriptDir "server.py") $ServerPy -Force
if (Test-Path (Join-Path $ScriptDir "LEIA-ME.md")) {
    Copy-Item (Join-Path $ScriptDir "LEIA-ME.md") (Join-Path $ProjectDir "LEIA-ME.md") -Force
}
Write-Host "Pasta do projeto OK (autocontida, separada dos seus outros projetos)" -ForegroundColor Green

Write-Host "`n== 5/7 Criando virtual environment em $VenvDir ==" -ForegroundColor Cyan
if (-not (Test-Path $VenvPython)) {
    & $Python -m venv $VenvDir
}
Write-Host "venv OK: $VenvPython" -ForegroundColor Green

Write-Host "`n== 6/7 Instalando dependencias (yt-dlp, openai-whisper, mcp) ==" -ForegroundColor Cyan
Write-Host "Isso pode demorar alguns minutos (o whisper baixa o PyTorch)..."
& $VenvPython -m pip install --upgrade pip
& $VenvPython -m pip install --upgrade yt-dlp openai-whisper mcp
if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar dependencias no venv." }
Write-Host "Dependencias OK" -ForegroundColor Green

Write-Host "`n== 7/7 Configurando Claude Desktop (preserva servers existentes) ==" -ForegroundColor Cyan
& $VenvPython (Join-Path $ScriptDir "merge_config.py") $ConfigPath $VenvPython $ServerPy
if ($LASTEXITCODE -ne 0) { throw "Falha ao atualizar o claude_desktop_config.json." }

Write-Host "`n== Verificacao final ==" -ForegroundColor Cyan
& $VenvPython -c "import whisper; import mcp; print('OK: whisper + mcp importados')"
if ($LASTEXITCODE -ne 0) { throw "Verificacao falhou: whisper/mcp nao importam no venv." }
where.exe yt-dlp 2>$null
where.exe ffmpeg 2>$null

# Limpeza de instalacao antiga (layout anterior em 2 pastas), se existir
foreach ($old in @("C:\mcp-transcriber-env", "C:\mcp-servers")) {
    if (Test-Path $old) {
        Write-Host "AVISO: encontrei instalacao antiga em $old — nao e mais usada, pode apagar." -ForegroundColor Yellow
    }
}

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host " TUDO PRONTO!" -ForegroundColor Green
Write-Host "============================================================"
Write-Host " Projeto instalado em: $ProjectDir (pasta unica e isolada)"
Write-Host ""
Write-Host " 1. Feche o Claude Desktop (clique direito no icone > Sair)"
Write-Host " 2. Abra novamente"
Write-Host " 3. Teste com:"
Write-Host "    Analisa o perfil @isabelamatte — transcreve os 3 ultimos"
Write-Host "    Reels e me diz quais padroes de roteiro ela usa, qual o"
Write-Host "    ritmo de fala e como sao os hooks."
Write-Host ""
Write-Host " Obs: na 1a transcricao o Whisper baixa o modelo (~1,5 GB)."
Write-Host " Para os Reels, mantenha-se logado no Instagram pelo Chrome."
Write-Host " Transcricoes salvas em: $ProjectDir\transcricoes"
Write-Host "============================================================"
